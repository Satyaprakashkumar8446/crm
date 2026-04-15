const Customer = require('../models/Customer');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private
const getCustomers = async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
        name: {
          $regex: req.query.keyword,
          $options: 'i',
        },
      }
    : {};

  const count = await Customer.countDocuments({ ...keyword });
  const customers = await Customer.find({ ...keyword })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({ customers, page, pages: Math.ceil(count / pageSize), total: count });
};

// @desc    Get customer by ID
// @route   GET /api/customers/:id
// @access  Private
const getCustomerById = async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (customer) {
    res.json(customer);
  } else {
    res.status(404).json({ message: 'Customer not found' });
  }
};

// @desc    Create a customer
// @route   POST /api/customers
// @access  Private
const createCustomer = async (req, res) => {
  const { name, fatherName, address, city, pincode, age } = req.body;

  const customer = new Customer({
    name,
    fatherName,
    address,
    city,
    pincode,
    age,
  });

  const createdCustomer = await customer.save();
  res.status(201).json(createdCustomer);
};

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = async (req, res) => {
  const { name, fatherName, address, city, pincode, age } = req.body;

  const customer = await Customer.findById(req.params.id);

  if (customer) {
    customer.name = name || customer.name;
    customer.fatherName = fatherName || customer.fatherName;
    customer.address = address || customer.address;
    customer.city = city || customer.city;
    customer.pincode = pincode || customer.pincode;
    customer.age = age || customer.age;

    const updatedCustomer = await customer.save();
    res.json(updatedCustomer);
  } else {
    res.status(404).json({ message: 'Customer not found' });
  }
};

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private
const deleteCustomer = async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (customer) {
    await customer.deleteOne();
    res.json({ message: 'Customer removed' });
  } else {
    res.status(404).json({ message: 'Customer not found' });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
};
