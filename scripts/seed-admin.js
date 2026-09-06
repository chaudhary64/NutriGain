const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// Minimal .env.local loader (no dotenv dependency needed).
(function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, raw] = match;
    const value = raw.replace(/^['"]|['"]$/g, '');
    if (!(key in process.env)) process.env[key] = value;
  }
})();

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = (process.env.SEED_ADMIN_EMAIL || 'chiragchoudhary64@gmail.com').toLowerCase();
const ADMIN_NAME = process.env.SEED_ADMIN_NAME || 'Chirag Choudhary';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD || '123456789';

async function main() {
  if (!MONGODB_URI) {
    console.error('Error: MONGODB_URI is not set. Add it to .env.local first.');
    process.exit(1);
  }

  if (ADMIN_PASSWORD.length < 6) {
    console.error('Error: admin password must be at least 6 characters.');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI, { dbName: 'nutrigain' });

  const User = mongoose.models.User || mongoose.model('User', require('../models/User').schema);

  const existing = await User.findOne({ email: ADMIN_EMAIL });

  if (existing) {
    if (!existing.isAdmin) {
      await User.updateOne({ _id: existing._id }, { $set: { isAdmin: true } });
      console.log(`Existing user ${ADMIN_EMAIL} promoted to admin.`);
    } else {
      console.log(`Admin already exists: ${ADMIN_EMAIL}`);
    }
  } else {
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await User.create({
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: ADMIN_NAME,
      isAdmin: true,
    });
    console.log(`Admin created: ${ADMIN_EMAIL}`);
  }

  await mongoose.disconnect();
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
