const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  fatherName: {
    type: String,
    required: [true, 'Please add father name']
  },
  address: {
    type: String,
    required: [true, 'Please add an address']
  },
  city: {
    type: String,
    required: [true, 'Please add a city']
  },
  pincode: {
    type: String,
    required: [true, 'Please add a pincode']
  },
  age: {
    type: Number,
    required: [true, 'Please add age']
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Customer', customerSchema);
