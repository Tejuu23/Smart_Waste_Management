const express = require('express');
const { auth } = require('../middleware/auth');
const Bin = require('../models/Bin');

const router = express.Router();

function sensorAuth(req) {
    const key = req.headers['x-sensor-key'];
    return key && key === (process.env.SENSOR_KEY || 'dev_sensor_key');
}

// Admin: create/update bins
router.post('/', auth(['admin']), async (req, res) => {
	const bin = await Bin.create(req.body);
	return res.json(bin);
});

router.get('/', auth(['admin', 'citizen', 'staff']), async (req, res) => {
	const bins = await Bin.find().lean();
	return res.json(bins);
});

// Sensor/IoT: update fill level
router.post('/:id/sensor-update', async (req, res) => {
    if (!sensorAuth(req)) return res.status(401).json({ message: 'Unauthorized' });
    const { fillLevel } = req.body;
    if (typeof fillLevel !== 'number') return res.status(400).json({ message: 'fillLevel must be number' });
    let status = 'normal';
    if (fillLevel >= 95) status = 'overflow'; else if (fillLevel >= 80) status = 'full';
    const updated = await Bin.findByIdAndUpdate(
        req.params.id,
        { fillLevel, status, sensorLastSeen: new Date() },
        { new: true }
    );
    const io = req.app.get('io');
    io.emit('bin:update', { id: updated._id, fillLevel: updated.fillLevel, status: updated.status });
    if (fillLevel >= 80) {
        io.emit('bin:alert', { id: updated._id, level: updated.fillLevel, status: updated.status });
    }
    return res.json(updated);
});

module.exports = router;


