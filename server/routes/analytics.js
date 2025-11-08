const express = require('express');
const { auth } = require('../middleware/auth');
const Complaint = require('../models/Complaint');
const Task = require('../models/Task');
const Bin = require('../models/Bin');

const router = express.Router();

// Daily/weekly waste patterns (complaints per day, bins full events)
router.get('/patterns', auth(['admin']), async (_req, res) => {
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const complaints = await Complaint.aggregate([
    { $match: { createdAt: { $gte: since } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  const bins = await Bin.aggregate([
    { $match: { sensorLastSeen: { $gte: since }, fillLevel: { $gte: 80 } } },
    { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$sensorLastSeen' } }, alerts: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  return res.json({ complaintsPerDay: complaints, binAlertsPerDay: bins });
});

// Areas with recurring issues (by address string)
router.get('/recurring-areas', auth(['admin']), async (_req, res) => {
  const top = await Complaint.aggregate([
    { $match: { 'location.address': { $ne: null } } },
    { $group: { _id: '$location.address', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
  ]);
  return res.json(top);
});

// Staff efficiency (completed tasks count and avg resolution time)
router.get('/staff-efficiency', auth(['admin']), async (_req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const stats = await Task.aggregate([
    { $match: { status: 'completed', completedAt: { $gte: since } } },
    { $lookup: { from: 'users', localField: 'assignedTo', foreignField: '_id', as: 'staff' } },
    { $unwind: '$staff' },
    { $lookup: { from: 'complaints', localField: 'complaint', foreignField: '_id', as: 'comp' } },
    { $unwind: '$comp' },
    { $project: { assignedTo: 1, 'staff.name': 1, completedAt: 1, createdAt: '$comp.createdAt' } },
    { $addFields: { resolutionMs: { $subtract: ['$completedAt', '$createdAt'] } } },
    { $group: { _id: { id: '$assignedTo', name: '$staff.name' }, completed: { $sum: 1 }, avgResolutionMs: { $avg: '$resolutionMs' } } },
    { $sort: { completed: -1 } }
  ]);
  return res.json(stats);
});

// CSV export for complaints or tasks
router.get('/export.csv', auth(['admin']), async (req, res) => {
  const { type = 'complaints' } = req.query;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=${type}.csv`);
  if (type === 'tasks') {
    const list = await Task.find().populate('complaint').populate('assignedTo').lean();
    const rows = [['TaskID', 'ComplaintID', 'AssignedTo', 'Status', 'CompletedAt']];
    for (const t of list) rows.push([t._id, t.complaint?._id, t.assignedTo?.name, t.status, t.completedAt || '']);
    return res.send(rows.map(r => r.join(',')).join('\n'));
  }
  const list = await Complaint.find().populate('citizen').populate('assignedTo').lean();
  const rows = [['ComplaintID', 'Citizen', 'AssignedTo', 'Status', 'Priority', 'CreatedAt']];
  for (const c of list) rows.push([c._id, c.citizen?.name, c.assignedTo?.name || '', c.status, c.priorityScore || 0, c.createdAt.toISOString()]);
  return res.send(rows.map(r => r.join(',')).join('\n'));
});

module.exports = router;


