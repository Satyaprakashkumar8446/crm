const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// ================= CORS CONFIG =================
const allowedOrigins = [
  'http://localhost:5173', // local frontend
  'https://crm-1-1lyx713pu-satyaprakashkumar8446s-projects.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (
      !origin || // allow Postman / mobile apps
      allowedOrigins.includes(origin) ||
      origin.includes('vercel.app') // allow all Vercel deployments
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
// =================================================

// Middleware
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/bills', require('./routes/billRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Test route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// PORT
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});