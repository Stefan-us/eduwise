const express = require('express');
const { updateUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.put('/update', protect, updateUser);

module.exports = router;