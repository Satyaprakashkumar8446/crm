const express = require('express');
const router = express.Router();
const { getPendingPayments, getCompletedPayments, markAsPaid } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/pending', protect, getPendingPayments);
router.get('/completed', protect, getCompletedPayments);
router.put('/:id/pay', protect, markAsPaid);

module.exports = router;
