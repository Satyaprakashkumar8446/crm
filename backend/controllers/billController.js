const Bill = require('../models/Bill');
const Payment = require('../models/Payment');

// @desc    Create new bill
// @route   POST /api/bills
// @access  Private
const createBill = async (req, res) => {
  const { customer, medicines, status, expectedPaymentDate } = req.body;

  if (medicines && medicines.length === 0) {
    res.status(400).json({ message: 'No medicines in bill' });
    return;
  }

  // Calculate total amount from medicines array
  let totalAmount = 0;
  const processedMedicines = medicines.map(med => {
    const total = med.quantity * med.price;
    totalAmount += total;
    return { ...med, total };
  });

  const bill = new Bill({
    customer,
    medicines: processedMedicines,
    totalAmount,
    status
  });

  const createdBill = await bill.save();

  // Create payment record
  const payment = new Payment({
    bill: createdBill._id,
    customer,
    amount: totalAmount,
    status,
    expectedPaymentDate: status === 'Unpaid' ? expectedPaymentDate : null,
    actualPaymentDate: status === 'Paid' ? Date.now() : null
  });
  
  await payment.save();

  res.status(201).json(createdBill);
};

// @desc    Get bill by ID
// @route   GET /api/bills/:id
// @access  Private
const getBillById = async (req, res) => {
  const bill = await Bill.findById(req.params.id).populate('customer', 'name fatherName address city pincode');

  if (bill) {
    res.json(bill);
  } else {
    res.status(404).json({ message: 'Bill not found' });
  }
};

// @desc    Get all bills for a customer
// @route   GET /api/bills/customer/:customerId
// @access  Private
const getBillsByCustomer = async (req, res) => {
  const bills = await Bill.find({ customer: req.params.customerId }).sort({ createdAt: -1 });
  res.json(bills);
};

// @desc    Get recent bills (all)
// @route   GET /api/bills
// @access  Private
const getBills = async (req, res) => {
  const bills = await Bill.find({}).populate('customer', 'name').sort({ createdAt: -1 }).limit(10);
  res.json(bills);
};

module.exports = {
  createBill,
  getBillById,
  getBillsByCustomer,
  getBills
};
