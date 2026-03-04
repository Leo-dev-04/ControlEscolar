const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function crearDirector() {
    try {
        const connection = await mysql.createConnection({
            uri: 'mysql://root:oxKlFsqwYkLOnoLJDwsjXYqvJSIkxqAa@mainline.proxy.rlwy.net:53224/railway',
            multipleStatements: true
        });

        console.log('✅ Conectado a Railway');

        // Hashear la contraseña
        const passwordHash = await bcrypt.hash('director123', 10);

        // Insertar el director
        await connection.query(
            `INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES (?, ?, ?, 'director', TRUE)`,
            ['Director General', 'director@escuela.com', passwordHash]
        );

        console.log('🎉 ¡Cuenta de Director creada exitosamente!');
        console.log('📧 Email: director@escuela.com');
        console.log('🔑 Contraseña: director123');

        await connection.end();
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

crearDirector();
