const User = require('../models/User');

async function seedAdminUser() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin123@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin 123';
  try {
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      return { created: false, message: 'Admin user already exists' };
    }
    const user = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      password: adminPassword,
      phone: '0771234567',
      role: 'admin',
      isVerified: true,
      isActive: true,
      address: { city: 'Colombo', district: 'Colombo' },
    });
    await user.save();
    return { created: true, message: 'Admin user created' };
  } catch (err) {
    console.error('Admin seed error:', err);
    return { created: false, error: err.message };
  }
}

module.exports = { seedAdminUser };


