const readline = require('readline');
const bcrypt = require('bcryptjs');
const { sequelize, User, Role, UserRole } = require('../models');
const { ROLES } = require('../config/constants');
const env = require('../config/env');

function ask(rl, question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function setupSuperAdmin() {
  let rl = null;
  try {
    console.log('==============================================');
    console.log('🛡️  Rentora Super Admin Setup Service');
    console.log('==============================================\n');

    await sequelize.authenticate();

    let email = env.SEED_CONFIG.ADMIN_EMAIL;
    let password = env.SEED_CONFIG.ADMIN_PASSWORD;
    let fullName = 'Super Admin';

    // If environment variables are not provided or --interactive flag is passed
    const isInteractive = process.argv.includes('--interactive') || (!email || !password);

    if (isInteractive) {
      rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      fullName = (await ask(rl, 'Enter Admin Full Name (Default: Super Admin): ')) || 'Super Admin';
      email = await ask(rl, 'Enter Admin Email (e.g. admin@rentora.in): ');
      
      if (!email || !email.includes('@')) {
        console.error('❌ Invalid email address provided.');
        process.exit(1);
      }

      password = await ask(rl, 'Enter Admin Password (min 8 chars): ');
      if (!password || password.length < 8) {
        console.error('❌ Password must be at least 8 characters long.');
        process.exit(1);
      }
    } else {
      console.log(`ℹ️ Initializing Super Admin from environment configuration: ${email}`);
    }

    const [adminRole] = await Role.findOrCreate({ where: { name: ROLES.SUPER_ADMIN } });
    const passwordHash = await bcrypt.hash(password, 12);

    const [user, created] = await User.findOrCreate({
      where: { email: email.toLowerCase().trim() },
      defaults: {
        fullName,
        passwordHash,
        phone: '+91 98765 00001',
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
      console.log(`ℹ️ Updated existing Super Admin credentials for: ${email}`);
    } else {
      console.log(`✅ Created new Super Admin user: ${email}`);
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
    if (rl) rl.close();
  }
}

setupSuperAdmin();
