// Script de diagnóstico para probar el endpoint de tareas
const mysql = require('mysql2/promise');

async function diagnosticar() {
    try {
        const connection = await mysql.createConnection({
            uri: 'mysql://root:oxKlFsqwYkLOnoLJDwsjXYqvJSIkxqAa@mainline.proxy.rlwy.net:53224/railway'
        });

        console.log('✅ Conectado a Railway');

        // 1. Verificar que la tabla tareas existe
        const [tables] = await connection.query("SHOW TABLES LIKE 'tareas'");
        console.log('Tabla tareas existe:', tables.length > 0);

        // 2. Verificar que la tabla entregas_tareas existe
        const [tables2] = await connection.query("SHOW TABLES LIKE 'entregas_tareas'");
        console.log('Tabla entregas_tareas existe:', tables2.length > 0);

        // 3. Ver estructura de entregas_tareas
        const [columns] = await connection.query("DESCRIBE entregas_tareas");
        console.log('\nEstructura entregas_tareas:');
        columns.forEach(col => console.log(`  ${col.Field} - ${col.Type} - Null: ${col.Null} - Default: ${col.Default}`));

        // 4. Ver estructura de tareas
        const [columns2] = await connection.query("DESCRIBE tareas");
        console.log('\nEstructura tareas:');
        columns2.forEach(col => console.log(`  ${col.Field} - ${col.Type} - Null: ${col.Null} - Default: ${col.Default}`));

        // 5. Verificar foreign keys
        const [fks] = await connection.query(`
      SELECT TABLE_NAME, COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE TABLE_SCHEMA = 'railway' AND REFERENCED_TABLE_NAME IS NOT NULL
      AND TABLE_NAME IN ('tareas', 'entregas_tareas')
    `);
        console.log('\nForeign Keys:');
        fks.forEach(fk => console.log(`  ${fk.TABLE_NAME}.${fk.COLUMN_NAME} -> ${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}`));

        // 6. Verificar usuarios existentes
        const [users] = await connection.query("SELECT id, nombre, rol FROM usuarios");
        console.log('\nUsuarios:');
        users.forEach(u => console.log(`  ID: ${u.id} - ${u.nombre} (${u.rol})`));

        // 7. Verificar alumnos existentes
        const [alumnos] = await connection.query("SELECT id, nombre, apellidos, grupo_id FROM alumnos WHERE activo = TRUE LIMIT 5");
        console.log('\nAlumnos (primeros 5):');
        alumnos.forEach(a => console.log(`  ID: ${a.id} - ${a.nombre} ${a.apellidos} (grupo: ${a.grupo_id})`));

        // 8. Intentar insertar una tarea de prueba
        console.log('\n--- PRUEBA DE INSERCIÓN ---');
        try {
            const [result] = await connection.query(
                `INSERT INTO tareas (grupo_id, titulo, descripcion, fecha_asignacion, fecha_entrega, maestro_id) VALUES (?, ?, ?, ?, ?, ?)`,
                [1, 'Tarea de prueba diagnóstico', null, '2026-03-03', '2026-03-04', users[0].id]
            );
            console.log('✅ Tarea creada con ID:', result.insertId);

            // 9. Intentar insertar entregas
            if (alumnos.length > 0) {
                try {
                    await connection.query(
                        `INSERT INTO entregas_tareas (tarea_id, alumno_id, entregada, fecha_entrega, observaciones) VALUES (?, ?, ?, ?, ?)`,
                        [result.insertId, alumnos[0].id, true, new Date(), null]
                    );
                    console.log('✅ Entrega registrada exitosamente');
                } catch (err) {
                    console.error('❌ Error al insertar entrega:', err.message);
                    console.error('   SQL State:', err.sqlState);
                    console.error('   Error Code:', err.errno);
                }
            }

            // Limpiar: borrar la tarea de prueba
            await connection.query('DELETE FROM entregas_tareas WHERE tarea_id = ?', [result.insertId]);
            await connection.query('DELETE FROM tareas WHERE id = ?', [result.insertId]);
            console.log('🧹 Datos de prueba limpiados');
        } catch (err) {
            console.error('❌ Error al insertar tarea:', err.message);
            console.error('   SQL State:', err.sqlState);
            console.error('   Error Code:', err.errno);
        }

        await connection.end();
    } catch (error) {
        console.error('❌ Error general:', error.message);
    }
}

diagnosticar();
