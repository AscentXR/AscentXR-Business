const { getAuth } = require('../config/firebase');
const db = require('../db/connection');

async function createUser({ email, displayName, password, role = 'viewer' }) {
  // Create in Firebase
  const firebaseUser = await getAuth().createUser({
    email,
    displayName,
    password
  });

  // Set custom claims for role
  await getAuth().setCustomUserClaims(firebaseUser.uid, { role });

  // Insert into PostgreSQL
  const result = await db.query(
    `INSERT INTO app_users (firebase_uid, email, display_name, role)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [firebaseUser.uid, email, displayName, role]
  );

  return result.rows[0];
}

async function listUsers() {
  const result = await db.query(
    `SELECT id, firebase_uid, email, display_name, role, is_enabled, last_login_at, created_at, updated_at
     FROM app_users
     WHERE deleted_at IS NULL
     ORDER BY created_at DESC`
  );
  return result.rows;
}

async function getUserByUid(uid) {
  const result = await db.query(
    `SELECT * FROM app_users WHERE firebase_uid = $1 AND deleted_at IS NULL`,
    [uid]
  );
  return result.rows[0] || null;
}

async function updateRole(uid, role) {
  if (!['admin', 'viewer'].includes(role)) {
    throw new Error('Invalid role. Must be admin or viewer.');
  }

  // Update Firebase custom claims
  await getAuth().setCustomUserClaims(uid, { role });

  // Revoke tokens to force refresh
  await getAuth().revokeRefreshTokens(uid);

  // Update PostgreSQL
  const result = await db.query(
    `UPDATE app_users SET role = $1, updated_at = CURRENT_TIMESTAMP
     WHERE firebase_uid = $2 AND deleted_at IS NULL
     RETURNING *`,
    [role, uid]
  );

  return result.rows[0];
}

async function disableUser(uid) {
  await getAuth().updateUser(uid, { disabled: true });
  await getAuth().revokeRefreshTokens(uid);

  const result = await db.query(
    `UPDATE app_users SET is_enabled = false, updated_at = CURRENT_TIMESTAMP
     WHERE firebase_uid = $1 AND deleted_at IS NULL
     RETURNING *`,
    [uid]
  );

  return result.rows[0];
}

async function enableUser(uid) {
  await getAuth().updateUser(uid, { disabled: false });

  const result = await db.query(
    `UPDATE app_users SET is_enabled = true, updated_at = CURRENT_TIMESTAMP
     WHERE firebase_uid = $1 AND deleted_at IS NULL
     RETURNING *`,
    [uid]
  );

  return result.rows[0];
}

async function resetPassword(uid) {
  const user = await getAuth().getUser(uid);
  const link = await getAuth().generatePasswordResetLink(user.email);
  return { email: user.email, resetLink: link };
}

async function deleteUser(uid) {
  // Delete from Firebase
  await getAuth().deleteUser(uid);

  // Soft delete in PostgreSQL
  const result = await db.query(
    `UPDATE app_users SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
     WHERE firebase_uid = $1 AND deleted_at IS NULL
     RETURNING *`,
    [uid]
  );

  return result.rows[0];
}

async function syncUser(firebaseUser) {
  const { uid, email, displayName } = firebaseUser;

  const result = await db.query(
    `INSERT INTO app_users (firebase_uid, email, display_name, last_login_at)
     VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
     ON CONFLICT (firebase_uid) DO UPDATE SET
       email = EXCLUDED.email,
       display_name = COALESCE(EXCLUDED.display_name, app_users.display_name),
       last_login_at = CURRENT_TIMESTAMP,
       updated_at = CURRENT_TIMESTAMP
     RETURNING *`,
    [uid, email, displayName || email]
  );

  return result.rows[0];
}

module.exports = {
  createUser,
  listUsers,
  getUserByUid,
  updateRole,
  disableUser,
  enableUser,
  resetPassword,
  deleteUser,
  syncUser
};
