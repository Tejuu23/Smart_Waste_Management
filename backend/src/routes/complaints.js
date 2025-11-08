const router = require('express').Router()
const Complaint = require('../models/Complaint')
const { requireAuth } = require('../middleware/auth')

module.exports = (io) => {
  router.post('/', requireAuth(['citizen', 'admin', 'staff']), async (req, res) => {
    try {
      const { title, description, imageUrl, longitude, latitude, category, priority } = req.body
      
      if (!title) {
        return res.status(400).json({ error: 'Title is required' })
      }
      
      const complaint = await Complaint.create({
        userId: req.user.id,
        title,
        description,
        imageUrl,
        category: category || 'Garbage Collection',
        priority: priority || 'Medium',
        location: { 
          type: 'Point', 
          coordinates: [Number(longitude)||0, Number(latitude)||0] 
        },
        severityScore: priority === 'High' ? 50 : priority === 'Medium' ? 30 : 10
      })
      
      // Award eco-points and increment complaint count
      const User = require('../models/User')
      await User.findByIdAndUpdate(req.user.id, { 
        $inc: { ecoPoints: 10, complaintsCount: 1 } 
      })
      
      // Notify admin about new complaint (with reporter name)
      const reporter = await require('../models/User').findById(req.user.id).select('name')
      io.emit('complaint:new', { 
        id: complaint._id, 
        title: complaint.title,
        userId: complaint.userId,
        reporterName: reporter?.name || 'User',
        category: complaint.category,
        priority: complaint.priority
      })
      res.json(complaint)
    } catch (error) {
      console.error('Complaint creation error:', error)
      res.status(500).json({ error: error.message || 'Failed to create complaint' })
    }
  })

  // Get complaints - admin/staff see all, citizens see only their own, include reporter name
  router.get('/', requireAuth(['citizen', 'admin', 'staff']), async (req, res) => {
    try {
      let items
      if (req.user.role === 'citizen') {
        // Citizens can only see their own complaints
        items = await Complaint.find({ userId: req.user.id })
          .populate('userId', 'name')
          .populate('assignedBy', 'name email role')
          .populate('resolvedBy', 'name email role')
          .sort({ createdAt: -1 })
          .limit(200)
      } else {
        // Admin and staff can see all complaints
        items = await Complaint.find()
          .populate('userId', 'name')
          .populate('assignedBy', 'name email role')
          .populate('resolvedBy', 'name email role')
          .sort({ createdAt: -1 })
          .limit(200)
      }
      res.json(items)
    } catch (error) {
      console.error('Failed to fetch complaints:', error)
      res.status(500).json({ error: 'Failed to fetch complaints' })
    }
  })

  router.post('/:id/resolve', requireAuth(['admin', 'staff']), async (req, res) => {
    try {
      // Enforce proof image on resolve
      if (!req.body.proofImageUrl) {
        return res.status(400).json({ error: 'Proof image is required to resolve the task' })
      }
      const update = { status: 'resolved', proofImageUrl: req.body.proofImageUrl, resolvedBy: req.user.id }
      const c = await Complaint.findByIdAndUpdate(req.params.id, update, { new: true })
      if (!c) {
        return res.status(404).json({ error: 'Complaint not found' })
      }
      
      // Populate user to get citizen info
      await c.populate('userId', 'name email assignedBy').populate('assignedBy', 'name email')
      
      // Update team counters if assigned
      try {
        if (c.assignedTeam) {
          const Team = require('../models/Team')
          await Team.findOneAndUpdate(
            { name: c.assignedTeam },
            { $inc: { activeTasks: -1, completed: 1 } },
            { new: true }
          )
        }
      } catch (err) {
        console.warn('Failed to update team counters on resolve:', err?.message || err)
      }
      
      // Send notifications to both citizen and admin
      io.emit('complaint:resolved', { 
        id: c._id, 
        title: c.title,
        userId: c.userId?._id,
        message: `Your complaint "${c.title}" has been resolved!`
      })
      
      // Also emit to specific user if they're connected
      io.emit(`user:${c.userId?._id}:notification`, {
        type: 'complaint_resolved',
        message: `Your complaint "${c.title}" has been resolved!`,
        complaintId: c._id
      })
      // Notify admin who assigned, if available
      if (c.assignedBy) {
        io.emit(`user:${c.assignedBy.toString()}:notification`, {
          type: 'task_resolved',
          message: `Task for complaint "${c.title}" has been resolved by team ${c.assignedTeam || ''}`.trim(),
          complaintId: c._id
        })
      }
      
      res.json(c)
    } catch (error) {
      console.error('Failed to resolve complaint:', error)
      res.status(500).json({ error: 'Failed to resolve complaint' })
    }
  })

  router.post('/:id/assign', requireAuth(['admin', 'staff']), async (req, res) => {
    try {
      const { team } = req.body
      
      // Check if team is on break
      const Team = require('../models/Team')
      const teamData = await Team.findOne({ name: team }).populate('members', '_id')
      if (teamData && teamData.status === 'Break') {
        return res.status(400).json({ error: 'Cannot assign to team on break' })
      }
      
      const c = await Complaint.findByIdAndUpdate(req.params.id, { 
        status: 'in_progress',
        assignedTeam: team,
        assignedBy: req.user.id
      }, { new: true })
      if (!c) {
        return res.status(404).json({ error: 'Complaint not found' })
      }
      
      // Increment team's active tasks
      try {
        await Team.findOneAndUpdate(
          { name: team },
          { $inc: { activeTasks: 1 } },
          { new: true }
        )
      } catch (err) {
        console.warn('Failed to increment team activeTasks on assign:', err?.message || err)
      }
      
      io.emit('complaint:assigned', { id: c._id, team })
      // Notify each team member
      try {
        if (teamData?.members?.length) {
          for (const m of teamData.members) {
            const uid = m._id?.toString?.() || m.toString()
            io.emit(`user:${uid}:notification`, {
              type: 'task_assigned',
              message: `New task assigned to ${team}: ${c.title}`,
              complaintId: c._id
            })
          }
        }
      } catch (err) {
        console.warn('Failed to emit team member notifications:', err?.message || err)
      }
      res.json(c)
    } catch (error) {
      console.error('Failed to assign complaint:', error)
      res.status(500).json({ error: 'Failed to assign complaint' })
    }
  })

  return router
}
