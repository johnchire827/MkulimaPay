const { User } = require('../models'); // ✅ Add this line
exports.getUserBalance = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // In a real app, you'd calculate this from transactions
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ balance: user.balance || 0 });
  } catch (error) {
    console.error('Error fetching user balance:', error);
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
};