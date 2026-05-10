const path = require('path');
require(path.resolve(__dirname, '../apps/backend/node_modules/dotenv')).config({
  path: path.resolve(__dirname, '../.env'),
});
const bcrypt = require(path.resolve(__dirname, '../apps/backend/node_modules/bcryptjs'));
const mongoose = require(path.resolve(__dirname, '../apps/backend/node_modules/mongoose'));

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fintrace';

async function run() {
  try {
    console.log('Connecting to MongoDB at', uri);
    await mongoose.connect(uri, { autoIndex: false });

    const users = [
      { email: 'admin@fintrace.io', fullName: 'Admin User', passwordPlain: 'AdminPass123!', role: 'admin' },
      { email: 'investigator@fintrace.io', fullName: 'John Investigator', passwordPlain: 'InvestigatorPass123!', role: 'investigator' },
      { email: 'auditor@fintrace.io', fullName: 'Sarah Auditor', passwordPlain: 'AuditorPass123!', role: 'auditor' },
    ];

    // Clear users
    await mongoose.connection.collection('users').deleteMany({});

    // Hash and insert
    const docs = [];
    for (const u of users) {
      const hashed = await bcrypt.hash(u.passwordPlain, 10);
      docs.push({
        email: u.email.toLowerCase(),
        fullName: u.fullName,
        password: hashed,
        role: u.role,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    await mongoose.connection.collection('users').insertMany(docs);
    console.log('Seeded users:');
    users.forEach(u => console.log(` - ${u.email} / ${u.passwordPlain}`));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    try { await mongoose.disconnect(); } catch (e) {}
    process.exit(1);
  }
}

run();
