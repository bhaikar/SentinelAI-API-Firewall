const express = require('express');
const router = express.Router();

/**
 * Normal API endpoints - these are protected by SentinelAI
 */

// Public endpoint
router.get('/public/info', (req, res) => {
  res.json({
    message: 'This is a public endpoint',
    data: {
      service: 'SentinelAI Demo',
      version: '1.0.0'
    }
  });
});

// User endpoints
router.get('/users', (req, res) => {
  res.json({
    users: [
      { id: 1, name: 'Alice', role: 'user' },
      { id: 2, name: 'Bob', role: 'user' }
    ]
  });
});

router.post('/users', (req, res) => {
  const { name, email } = req.body;
  
  res.status(201).json({
    success: true,
    message: 'User created successfully',
    user: {
      id: Date.now(),
      name,
      email
    }
  });
});

// Auth endpoints
router.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simulated login
  res.json({
    success: true,
    message: 'Login successful',
    token: 'demo_token_' + Date.now()
  });
});

router.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  res.status(201).json({
    success: true,
    message: 'Registration successful',
    user: {
      id: Date.now(),
      name,
      email
    }
  });
});

// Admin endpoint (high sensitivity)
router.get('/admin/users', (req, res) => {
  res.json({
    message: 'Admin access granted',
    users: [
      { id: 1, name: 'Alice', role: 'admin' },
      { id: 2, name: 'Bob', role: 'user' }
    ]
  });
});

router.delete('/admin/user/:id', (req, res) => {
  res.json({
    success: true,
    message: `User ${req.params.id} deleted`
  });
});

// Database endpoint (very sensitive)
router.post('/database/query', (req, res) => {
  res.json({
    message: 'Query executed',
    results: []
  });
});

// Payment endpoint (sensitive)
router.post('/payment/process', (req, res) => {
  const { amount, card } = req.body;
  
  res.json({
    success: true,
    message: 'Payment processed',
    transactionId: 'txn_' + Date.now(),
    amount
  });
});

// Config endpoint (sensitive)
router.get('/config', (req, res) => {
  res.json({
    config: {
      apiVersion: '1.0',
      features: ['auth', 'payments']
    }
  });
});

router.post('/config/update', (req, res) => {
  res.json({
    success: true,
    message: 'Configuration updated'
  });
});

module.exports = router;
