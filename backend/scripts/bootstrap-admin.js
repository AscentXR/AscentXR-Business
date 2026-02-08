#!/usr/bin/env node
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { getAuth } = require('../config/firebase');
const db = require('../db/connection');

async function bootstrapAdmin(email, displayName, password) {
  if (!email || !displayName || !password) {
    console.error('Usage: node scripts/bootstrap-admin.js <email> <displayName> <password>');
    process.exit(1);
  }

  try {
    console.log(`Creating admin user: ${email}`);

    // Create in Firebase
    const firebaseUser = await getAuth().createUser({
      email,
      displayName,
      password
    });
    console.log(`Firebase user created: ${firebaseUser.uid}`);

    // Set admin custom claims
    await getAuth().setCustomUserClaims(firebaseUser.uid, { role: 'admin' });
    console.log('Admin custom claims set');

    // Insert into PostgreSQL
    await db.query(
      `INSERT INTO app_users (firebase_uid, email, display_name, role)
       VALUES ($1, $2, $3, 'admin')
       ON CONFLICT (firebase_uid) DO UPDATE SET role = 'admin', updated_at = CURRENT_TIMESTAMP`,
      [firebaseUser.uid, email, displayName]
    );
    console.log('Database record created');

    console.log(`\nAdmin user created successfully!`);
    console.log(`  Email: ${email}`);
    console.log(`  UID: ${firebaseUser.uid}`);
    console.log(`  Role: admin`);
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin user:', err.message);
    process.exit(1);
  }
}

const [email, displayName, password] = process.argv.slice(2);
bootstrapAdmin(email, displayName, password);
