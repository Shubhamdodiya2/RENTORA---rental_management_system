const readline = require('readline');
const bcrypt = require('bcryptjs');
const { sequelize, User, Role, UserRole } = require('../models');
const { ROLES } = require('../config/constants');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function setupSuperAdmin() {
  try {
    console.log('==============================================');
    console.log('🛡️  Rentora Super Admin Interactive Setup CLI');
    console.log('==============================================\n');

    await sequelize.authenticate();

    const fullName = (await ask('Enter Admin Full Name (Default: Super Admin): ')) || 'Super Admin';
    const email = await ask('Enter Admin Email (e.g. admin@rentora.in): ');
    
    if (!email || !email.includes('@')) {
      console.error('❌ Invalid email address provided.');
      process.exit(1);
    }

    const password = await ask('Enter Admin Password (min 8 chars): ');
    if (!password || password.length < 8) {
      console.error('❌ Password must be at least 8 characters long.');
      process.exit(1);
    }

    const [adminRole] = await Role.findOrCreate({ where: { name: ROLES.SUPER_ADMIN } });
    const passwordHash = await bcrypt.hash(password, 12);

    const [user, created] = await User.findOrCreate({
      where: { email },
      defaults: {
        fullName,
        passwordHash,
        isActive: true,
        isVerified: true,
        mustChangePassword: false
      }
    });

    if (!created) {
      user.fullName = fullName;
      user.passwordHash = passwordHash;
      user.isActive = true;
      user.isVerified = true;
      await user.save();
      console.log(`\nℹ️ Updated existing Super Admin credentials for: ${email}`);
    } else {
      console.log(`\n✅ Created new Super Admin user: ${email}`);
    }

    await UserRole.findOrCreate({
      where: { userId: user.id, roleId: adminRole.id }
    });

    console.log('🎉 Super Admin setup completed successfully!\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Setup error:', error);
    process.exit(1);
  } finally {
    rl.close();
  }
}

setupSuperAdmin();
