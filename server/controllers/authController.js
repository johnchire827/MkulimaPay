const jwt = require('jsonwebtoken');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      email, 
      password, 
      role 
    } = req.body;
    
    // Validate input
    if (!name || !phone || !password || !role) {
      return res.status(400).json({ error: "All required fields are missing" });
    }
    
    // Validate role
    const validRoles = ['farmer', 'buyer', 'both'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role selection" });
    }
    
    // Check if phone number exists
    const existingUser = await User.findOne({ where: { phone_number: phone } });
    if (existingUser) {
      return res.status(400).json({ error: "Phone number already registered" });
    }
    
    // Create user - handle empty email
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      name,
      phone_number: phone,
      password: hashedPassword,
      role
    };
    
    // Only add email if provided and not empty
    if (email && email.trim() !== '') {
      userData.email = email;
    }
    
    const user = await User.create(userData);
    
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.status(201).json({ 
      message: "Registration successful!",
      user: {
        id: user.id,
        name: user.name,
        phone_number: user.phone_number,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    let errorMessage = "Registration failed";
    let details = error.message;
    
    // Handle specific errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      if (error.fields && error.fields.email) {
        errorMessage = "Email already registered";
        details = "The email address is already associated with another account";
      } else if (error.fields && error.fields.phone_number) {
        errorMessage = "Phone number already registered";
        details = "This phone number is already associated with another account";
      }
    } else if (error.name === 'SequelizeValidationError') {
      errorMessage = "Validation error";
      details = error.errors.map(e => e.message).join(', ');
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: details
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    // Validate input
    if (!phone || !password) {
      return res.status(400).json({ error: "Phone number and password are required" });
    }
    
    // Find user
    const user = await User.findOne({ where: { phone_number: phone } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.json({ 
      message: "Login successful!",
      token,
      user: {
        id: user.id,
        name: user.name,
        phone_number: user.phone_number,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: "Login failed" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Find user by ID
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Validate new password
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ 
      success: true,
      message: "Password updated successfully" 
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ 
      error: "Password change failed",
      details: error.message 
    });
  }
};