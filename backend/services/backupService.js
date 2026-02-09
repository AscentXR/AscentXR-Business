const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const AdmZip = require('adm-zip');
const { query, getClient } = require('../db/connection');

const BACKUP_DIR = process.env.BACKUP_DIR || '/tmp/backups';
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads');
const BATCH_SIZE = 5000;

let operationInProgress = false;

function getWebSocket() {
  try {
    return require('../websocket');
  } catch {
    return null;
  }
}

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

/**
 * Discover all user tables in the public schema.
 */
async function discoverTables() {
  const res = await query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `);
  return res.rows.map(r => r.table_name);
}

/**
 * Get column metadata for a table.
 */
async function getColumnMetadata(tableName) {
  const res = await query(`
    SELECT column_name, data_type, is_nullable, column_default,
           character_maximum_length, numeric_precision
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1
    ORDER BY ordinal_position
  `, [tableName]);
  return res.rows;
}

/**
 * Get schema info: columns, primary keys, foreign keys, indexes.
 */
async function getSchemaInfo(tables) {
  const schema = {};

  for (const table of tables) {
    const columns = await getColumnMetadata(table);

    const pkRes = await query(`
      SELECT kcu.column_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      WHERE tc.table_schema = 'public'
        AND tc.table_name = $1
        AND tc.constraint_type = 'PRIMARY KEY'
    `, [table]);

    const fkRes = await query(`
      SELECT
        kcu.column_name,
        ccu.table_name AS foreign_table,
        ccu.column_name AS foreign_column,
        tc.constraint_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.key_column_usage kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage ccu
        ON tc.constraint_name = ccu.constraint_name
        AND tc.table_schema = ccu.table_schema
      WHERE tc.table_schema = 'public'
        AND tc.table_name = $1
        AND tc.constraint_type = 'FOREIGN KEY'
    `, [table]);

    schema[table] = {
      columns,
      primaryKeys: pkRes.rows.map(r => r.column_name),
      foreignKeys: fkRes.rows,
    };
  }

  return schema;
}

/**
 * Build FK dependency order via topological sort.
 */
async function buildDependencyOrder() {
  const res = await query(`
    SELECT
      tc.table_name,
      ccu.table_name AS referenced_table
    FROM information_schema.referential_constraints rc
    JOIN information_schema.table_constraints tc
      ON rc.constraint_name = tc.constraint_name
      AND rc.constraint_schema = tc.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON rc.unique_constraint_name = ccu.constraint_name
      AND rc.unique_constraint_schema = ccu.constraint_schema
    WHERE tc.table_schema = 'public'
  `);

  // Build adjacency: table -> depends on these tables
  const deps = {};
  const allTables = new Set();
  for (const row of res.rows) {
    allTables.add(row.table_name);
    allTables.add(row.referenced_table);
    if (!deps[row.table_name]) deps[row.table_name] = new Set();
    if (row.table_name !== row.referenced_table) {
      deps[row.table_name].add(row.referenced_table);
    }
  }

  // Topological sort (Kahn's algorithm)
  const inDegree = {};
  const graph = {};
  for (const t of allTables) {
    inDegree[t] = 0;
    graph[t] = [];
  }
  for (const [table, depSet] of Object.entries(deps)) {
    for (const dep of depSet) {
      graph[dep].push(table);
      inDegree[table] = (inDegree[table] || 0) + 1;
    }
  }

  const queue = [];
  for (const t of allTables) {
    if (inDegree[t] === 0) queue.push(t);
  }

  const sorted = [];
  while (queue.length > 0) {
    const node = queue.shift();
    sorted.push(node);
    for (const neighbor of (graph[node] || [])) {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) queue.push(neighbor);
    }
  }

  // Add any tables not in FK graph
  const tables = await discoverTables();
  for (const t of tables) {
    if (!sorted.includes(t)) sorted.push(t);
  }

  return sorted;
}

/**
 * Create a full database backup as a ZIP file.
 */
async function createBackup({ label, createdBy, includeFiles = false } = {}) {
  if (operationInProgress) {
    throw new Error('A backup or restore operation is already in progress');
  }
  operationInProgress = true;
  const ws = getWebSocket();

  try {
    ensureBackupDir();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.zip`;
    const filePath = path.join(BACKUP_DIR, filename);

    const emitProgress = (data) => {
      if (ws && ws.emitBackupProgress) {
        ws.emitBackupProgress({ filename, ...data });
      }
    };

    emitProgress({ stage: 'starting', message: 'Discovering tables...' });

    const tables = await discoverTables();
    const totalSteps = tables.length + 2 + (includeFiles ? 1 : 0);
    let currentStep = 0;

    // Get schema info
    emitProgress({ stage: 'schema', message: 'Capturing schema...', progress: 0 });
    const schemaInfo = await getSchemaInfo(tables);
    currentStep++;

    // Export table data
    const tableCounts = {};
    const tableData = {};

    for (const table of tables) {
      currentStep++;
      const pct = Math.round((currentStep / totalSteps) * 100);
      emitProgress({ stage: 'exporting', message: `Exporting ${table}...`, progress: pct, table });

      const rows = [];
      let offset = 0;
      while (true) {
        const res = await query(
          `SELECT * FROM "${table}" LIMIT $1 OFFSET $2`,
          [BATCH_SIZE, offset]
        );
        rows.push(...res.rows);
        if (res.rows.length < BATCH_SIZE) break;
        offset += BATCH_SIZE;
      }

      tableCounts[table] = rows.length;
      tableData[table] = rows;
    }

    // Build manifest
    const manifest = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      label: label || `Backup ${new Date().toLocaleDateString()}`,
      createdBy: createdBy || 'system',
      tableCount: tables.length,
      totalRows: Object.values(tableCounts).reduce((a, b) => a + b, 0),
      tableCounts,
      includesFiles: includeFiles,
    };

    // Create ZIP
    emitProgress({ stage: 'packaging', message: 'Creating ZIP archive...', progress: 90 });

    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(filePath);
      const archive = archiver('zip', { zlib: { level: 6 } });

      output.on('close', resolve);
      archive.on('error', reject);
      archive.pipe(output);

      // Add manifest
      archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });

      // Add schema
      archive.append(JSON.stringify(schemaInfo, null, 2), { name: 'schema.json' });

      // Add table data
      for (const table of tables) {
        archive.append(JSON.stringify(tableData[table], null, 2), { name: `data/${table}.json` });
      }

      // Add uploaded files if requested
      if (includeFiles && fs.existsSync(UPLOAD_DIR)) {
        archive.directory(UPLOAD_DIR, 'files');
      }

      archive.finalize();
    });

    const stats = fs.statSync(filePath);
    emitProgress({ stage: 'complete', message: 'Backup complete', progress: 100, filename, size: stats.size });

    return {
      filename,
      size: stats.size,
      manifest,
    };
  } finally {
    operationInProgress = false;
  }
}

/**
 * Restore database from a backup ZIP file.
 */
async function restoreFromBackup(filename, { createdBy } = {}) {
  if (operationInProgress) {
    throw new Error('A backup or restore operation is already in progress');
  }

  // Validate filename
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    throw new Error('Invalid filename');
  }

  const filePath = path.resolve(BACKUP_DIR, filename);
  if (!filePath.startsWith(path.resolve(BACKUP_DIR))) {
    throw new Error('Invalid file path');
  }
  if (!fs.existsSync(filePath)) {
    throw new Error('Backup file not found');
  }

  operationInProgress = true;
  const ws = getWebSocket();

  try {
    const emitProgress = (data) => {
      if (ws && ws.emitRestoreProgress) {
        ws.emitRestoreProgress({ filename, ...data });
      }
    };

    emitProgress({ stage: 'starting', message: 'Reading backup archive...', progress: 0 });

    const zip = new AdmZip(filePath);
    const manifestEntry = zip.getEntry('manifest.json');
    if (!manifestEntry) {
      throw new Error('Invalid backup: missing manifest.json');
    }

    const manifest = JSON.parse(manifestEntry.getData().toString('utf8'));
    emitProgress({ stage: 'validating', message: `Restoring backup from ${manifest.timestamp}`, progress: 5 });

    // Build dependency order for safe TRUNCATE/INSERT
    const depOrder = await buildDependencyOrder();
    const reverseOrder = [...depOrder].reverse();

    // Read all table data from ZIP
    const tableData = {};
    for (const entry of zip.getEntries()) {
      if (entry.entryName.startsWith('data/') && entry.entryName.endsWith('.json')) {
        const tableName = path.basename(entry.entryName, '.json');
        try {
          tableData[tableName] = JSON.parse(entry.getData().toString('utf8'));
        } catch (parseErr) {
          throw new Error(`Corrupt backup: failed to parse data/${tableName}.json`);
        }
      }
    }

    const tablesToRestore = Object.keys(tableData);
    const totalSteps = tablesToRestore.length * 2 + 1;
    let currentStep = 0;

    // Perform restore in a transaction
    const client = await getClient();
    try {
      await client.query('BEGIN');

      // Disable FK checks during restore
      await client.query('SET CONSTRAINTS ALL DEFERRED');

      // TRUNCATE in reverse dependency order
      emitProgress({ stage: 'truncating', message: 'Clearing existing data...', progress: 10 });
      for (const table of reverseOrder) {
        if (tableData[table] !== undefined) {
          currentStep++;
          await client.query(`TRUNCATE TABLE "${table}" CASCADE`);
        }
      }

      // Also truncate tables not in the dependency graph
      for (const table of tablesToRestore) {
        if (!depOrder.includes(table)) {
          await client.query(`TRUNCATE TABLE "${table}" CASCADE`);
        }
      }

      // INSERT in dependency order
      for (const table of depOrder) {
        if (!tableData[table] || tableData[table].length === 0) continue;
        currentStep++;
        const pct = Math.round((currentStep / totalSteps) * 100);
        emitProgress({ stage: 'inserting', message: `Restoring ${table}...`, progress: Math.min(pct, 95), table });

        const rows = tableData[table];
        const columns = Object.keys(rows[0]);
        const quotedCols = columns.map(c => `"${c}"`).join(', ');

        // Insert in batches
        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
          const batch = rows.slice(i, i + BATCH_SIZE);
          const values = [];
          const placeholders = [];

          batch.forEach((row, batchIdx) => {
            const rowPlaceholders = columns.map((col, colIdx) => {
              values.push(row[col]);
              return `$${batchIdx * columns.length + colIdx + 1}`;
            });
            placeholders.push(`(${rowPlaceholders.join(', ')})`);
          });

          await client.query(
            `INSERT INTO "${table}" (${quotedCols}) VALUES ${placeholders.join(', ')}`,
            values
          );
        }
      }

      // Also insert tables not in the dependency graph
      for (const table of tablesToRestore) {
        if (depOrder.includes(table)) continue;
        if (!tableData[table] || tableData[table].length === 0) continue;

        const rows = tableData[table];
        const columns = Object.keys(rows[0]);
        const quotedCols = columns.map(c => `"${c}"`).join(', ');

        for (let i = 0; i < rows.length; i += BATCH_SIZE) {
          const batch = rows.slice(i, i + BATCH_SIZE);
          const values = [];
          const placeholders = [];

          batch.forEach((row, batchIdx) => {
            const rowPlaceholders = columns.map((col, colIdx) => {
              values.push(row[col]);
              return `$${batchIdx * columns.length + colIdx + 1}`;
            });
            placeholders.push(`(${rowPlaceholders.join(', ')})`);
          });

          await client.query(
            `INSERT INTO "${table}" (${quotedCols}) VALUES ${placeholders.join(', ')}`,
            values
          );
        }
      }

      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }

    // Restore uploaded files if present
    if (manifest.includesFiles) {
      const filesEntries = zip.getEntries().filter(e => e.entryName.startsWith('files/') && !e.isDirectory);
      if (filesEntries.length > 0) {
        emitProgress({ stage: 'files', message: 'Restoring uploaded files...', progress: 97 });
        if (!fs.existsSync(UPLOAD_DIR)) {
          fs.mkdirSync(UPLOAD_DIR, { recursive: true });
        }
        const resolvedUploadDir = path.resolve(UPLOAD_DIR);
        for (const entry of filesEntries) {
          const relativePath = entry.entryName.replace(/^files\//, '');
          const destPath = path.resolve(UPLOAD_DIR, relativePath);
          if (!destPath.startsWith(resolvedUploadDir)) {
            console.warn(`[BACKUP] Skipping file with path traversal: ${entry.entryName}`);
            continue;
          }
          const destDir = path.dirname(destPath);
          if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
          }
          fs.writeFileSync(destPath, entry.getData());
        }
      }
    }

    emitProgress({ stage: 'complete', message: 'Restore complete', progress: 100 });

    return {
      success: true,
      tablesRestored: tablesToRestore.length,
      rowsRestored: Object.values(tableData).reduce((sum, rows) => sum + rows.length, 0),
      manifest,
    };
  } finally {
    operationInProgress = false;
  }
}

/**
 * List all backups in the backup directory.
 */
function listBackups() {
  ensureBackupDir();
  const files = fs.readdirSync(BACKUP_DIR)
    .filter(f => f.endsWith('.zip'))
    .sort()
    .reverse();

  return files.map(filename => {
    const filePath = path.join(BACKUP_DIR, filename);
    const stats = fs.statSync(filePath);
    return {
      filename,
      size: stats.size,
      created: stats.mtime.toISOString(),
    };
  });
}

/**
 * Get detailed info about a backup by reading its manifest.
 */
function getBackupInfo(filename) {
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    throw new Error('Invalid filename');
  }
  const filePath = path.resolve(BACKUP_DIR, filename);
  if (!filePath.startsWith(path.resolve(BACKUP_DIR))) {
    throw new Error('Invalid file path');
  }
  if (!fs.existsSync(filePath)) {
    throw new Error('Backup file not found');
  }

  const zip = new AdmZip(filePath);
  const manifestEntry = zip.getEntry('manifest.json');
  if (!manifestEntry) {
    throw new Error('Invalid backup: missing manifest.json');
  }

  const manifest = JSON.parse(manifestEntry.getData().toString('utf8'));
  const stats = fs.statSync(filePath);

  return {
    filename,
    size: stats.size,
    created: stats.mtime.toISOString(),
    manifest,
  };
}

/**
 * Delete a backup file.
 */
function deleteBackup(filename) {
  if (!/^[a-zA-Z0-9._-]+$/.test(filename)) {
    throw new Error('Invalid filename');
  }
  const filePath = path.resolve(BACKUP_DIR, filename);
  if (!filePath.startsWith(path.resolve(BACKUP_DIR))) {
    throw new Error('Invalid file path');
  }
  if (!fs.existsSync(filePath)) {
    throw new Error('Backup file not found');
  }
  fs.unlinkSync(filePath);
  return { success: true, filename };
}

/**
 * Delete backups older than retentionDays.
 */
function cleanupOldBackups(retentionDays = 7) {
  ensureBackupDir();
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const files = fs.readdirSync(BACKUP_DIR).filter(f => f.endsWith('.zip'));
  let deleted = 0;

  for (const filename of files) {
    const filePath = path.join(BACKUP_DIR, filename);
    const stats = fs.statSync(filePath);
    if (stats.mtime.getTime() < cutoff) {
      fs.unlinkSync(filePath);
      deleted++;
    }
  }

  return { deleted, remaining: files.length - deleted };
}

module.exports = {
  createBackup,
  restoreFromBackup,
  listBackups,
  getBackupInfo,
  deleteBackup,
  cleanupOldBackups,
};
