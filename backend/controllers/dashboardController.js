const Customer = require('../models/Customer');
const Bill = require('../models/Bill');
const Payment = require('../models/Payment');

// @desc    Get dashboard metrics
// @route   GET /api/dashboard
// @access  Private
const getDashboardMetrics = async (req, res) => {
  try {
    const totalCustomers = await Customer.countDocuments();
    
    // Total Revenue (Completed payments)
    const completedPayments = await Payment.aggregate([
      { $match: { status: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = completedPayments.length > 0 ? completedPayments[0].total : 0;

    // Total Pending (Unpaid payments)
    const pendingPayments = await Payment.aggregate([
      { $match: { status: 'Unpaid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalPending = pendingPayments.length > 0 ? pendingPayments[0].total : 0;

    // Recent Bills
    const recentBills = await Bill.find({})
      .populate('customer', 'name fatherName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalCustomers,
      totalRevenue,
      totalPending,
      recentBills
    });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = { getDashboardMetrics };
