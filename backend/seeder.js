const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
  try {
    await User.deleteMany();

    const createdUsers = await User.create([
      {
        username: 'admin',
        password: 'password123', // Will be hashed securely by pre-save hook
      }
    ]);

    console.log('Data Imported - Admin user created: admin / password123');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

importData();
