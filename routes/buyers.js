const express = require('express');
const router = express.Router();

// Placeholder route
router.get('/', (req, res) => {
	res.json({ success: true, message: 'Buyers route is active' });
});

module.exports = router;

