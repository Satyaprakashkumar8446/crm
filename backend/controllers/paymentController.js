const Payment = require('../models/Payment');
const Bill = require('../models/Bill');

// @desc    Get all pending payments
// @route   GET /api/payments/pending
// @access  Private
const getPendingPayments = async (req, res) => {
  const payments = await Payment.find({ status: 'Unpaid' })
    .populate('customer', 'name fatherName')
    .populate('bill', 'totalAmount')
    .sort({ expectedPaymentDate: 1 });
  res.json(payments);
};

// @desc    Get all completed payments
// @route   GET /api/payments/completed
// @access  Private
const getCompletedPayments = async (req, res) => {
  const payments = await Payment.find({ status: 'Paid' })
    .populate('customer', 'name fatherName')
    .populate('bill', 'totalAmount')
    .sort({ actualPaymentDate: -1 });
  res.json(payments);
};

// @desc    Mark payment as paid
// @route   PUT /api/payments/:id/pay
// @access  Private
const markAsPaid = async (req, res) => {
  const payment = await Payment.findById(req.params.id);

  if (!payment) {
    res.status(404).json({ message: 'Payment not found' });
    return;
  }

  // Update payment
  payment.status = 'Paid';
  payment.actualPaymentDate = Date.now();
  await payment.save();

  // Update associated bill
  const bill = await Bill.findById(payment.bill);
  if (bill) {
    bill.status = 'Paid';
    await bill.save();
  }

  res.json(payment);
};

module.exports = {
  getPendingPayments,
  getCompletedPayments,
  markAsPaid
};
