const router = require('express').Router()
const multer = require('multer')
const { requireAuth } = require('../middleware/auth')

// Configure multer for memory storage (can be changed to disk storage later)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
})

// Basic image upload endpoint
router.post('/image', requireAuth(['citizen', 'admin', 'staff']), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' })
    }

    // For now, return a placeholder URL
    // In production, you would upload to Cloudinary, AWS S3, or similar service
    const imageUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
    
    res.json({
      url: imageUrl,
      message: 'Image uploaded successfully (base64 encoded)'
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Failed to upload image' })
  }
})

module.exports = router

