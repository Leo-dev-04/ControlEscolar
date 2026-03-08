const mysql = require('mysql2/promise');
const crypto = require('crypto');

const DB_URL = 'mysql://root:oxKlFsqwYkLOnoLJDwsjXYqvJSIkxqAa@mainline.proxy.rlwy.net:53224/railway';

async function main() {
    console.log('Conectando a Railway...');
    const c = await mysql.createConnection(DB_URL);

    try {
        await c.query('ALTER TABLE alumnos ADD COLUMN qr_token VARCHAR(64) UNIQUE AFTER parent_telefono');
        console.log('+ columna qr_token agregada');
    } catch (e) {
        console.log('columna qr_token ya existe');
    }

    const [rows] = await c.query('SELECT id FROM alumnos WHERE qr_token IS NULL');
    for (const r of rows) {
        await c.query('UPDATE alumnos SET qr_token=? WHERE id=?', [crypto.randomBytes(32).toString('hex'), r.id]);
    }
    console.log('Tokens generados:', rows.length);

    await c.query('DROP TABLE IF EXISTS email_log');
    console.log('email_log eliminada');

    try { await c.query('ALTER TABLE reportes_semanales DROP COLUMN enviado'); } catch (e) { }
    try { await c.query('ALTER TABLE reportes_semanales DROP COLUMN fecha_envio'); } catch (e) { }

    console.log('MIGRACION COMPLETADA');
    await c.end();
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
