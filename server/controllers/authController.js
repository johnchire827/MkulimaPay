const jwt = require('jsonwebtoken');
const { User } = require('../models');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.register = async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      email, 
      password, 
      role 
    } = req.body;
    
    if (!name || !phone || !password || !role) {
      return res.status(400).json({ error: "All required fields are missing" });
    }
    
    const validRoles = ['farmer', 'buyer', 'both'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: "Invalid role selection" });
    }
    
    const existingUser = await User.findOne({ where: { phone_number: phone } });
    if (existingUser) {
      return res.status(400).json({ error: "Phone number already registered" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      name,
      phone_number: phone,
      password: hashedPassword,
      role
    };
    
    if (email && email.trim() !== '') {
      userData.email = email;
    }
    
    const user = await User.create(userData);
    
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
    
    if (!phone || !password) {
      return res.status(400).json({ error: "Phone number and password are required" });
    }
    
    const user = await User.findOne({ where: { phone_number: phone } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
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

// ... existing code ...

exports.googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ error: "Google credential is required" });
    }
    
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;
    
    // Check if user exists by Google ID
    let user = await User.findOne({ where: { google_id: googleId } });
    
    if (!user) {
      // Check if user exists by email
      if (email) {
        user = await User.findOne({ where: { email } });
      }
      
      if (!user) {
        // Create new user with Google data
        // Generate a random password for Google users
        const randomPassword = Math.random().toString(36).slice(-16);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);
        
        user = await User.create({
          name,
          email,
          google_id: googleId,
          password: hashedPassword,
          role: 'buyer' // Default role
        });
      } else {
        // Update existing user with Google ID
        user.google_id = googleId;
        await user.save();
      }
    }
    
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    
    res.json({ 
      message: "Google authentication successful!",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone_number: user.phone_number,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(500).json({ 
      error: "Google authentication failed",
      details: error.message 
    });
  }
};

// ... existing code ...

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters" });
    }

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