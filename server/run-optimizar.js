const mysql = require('mysql2/promise');

async function run() {
    const uri = process.argv[2];
    if (!uri) {
        console.error('Proporciona la URI de conexión.');
        process.exit(1);
    }

    let connection;
    try {
        console.log('🔗 Conectando a Railway...');
        connection = await mysql.createConnection(uri);
        console.log('✅ Conexión exitosa. Aplicando índices...');

        const statements = [
            "CREATE INDEX idx_alumnos_grupo ON alumnos(grupo_id)",
            "CREATE INDEX idx_asistencias_grupo_fecha ON asistencias(grupo_id, fecha)",
            "CREATE INDEX idx_asistencias_alumno ON asistencias(alumno_id)",
            "CREATE INDEX idx_tareas_grupo ON tareas(grupo_id)",
            "CREATE INDEX idx_entregas_tarea ON entregas_tareas(tarea_id)",
            "CREATE INDEX idx_entregas_alumno ON entregas_tareas(alumno_id)",
            "CREATE INDEX idx_conducta_grupo_fecha ON conducta(grupo_id, fecha)",
            "CREATE INDEX idx_conducta_alumno ON conducta(alumno_id)",
            "CREATE INDEX idx_grupos_maestro ON grupos(maestro_id)",
            "CREATE INDEX idx_grupos_grado_seccion ON grupos(grado, seccion)",
            "CREATE INDEX idx_reportes_grupo ON reportes_semanales(grupo_id)",
            "CREATE INDEX idx_reportes_alumno ON reportes_semanales(alumno_id)"
        ];

        let exitos = 0;
        for (const sql of statements) {
            try {
                process.stdout.write(`   Ejecutando: ${sql} ... `);
                await connection.query(sql);
                console.log('¡Listo!');
                exitos++;
            } catch(e) {
                if (e.code === 'ER_DUP_KEYNAME') {
                    console.log('(Ya existía)');
                } else {
                    console.log('Error:', e.message);
                }
            }
        }
        
        console.log(`\n🎉 Completado. Se verificaron/crearon ${statements.length} índices.`);
    } catch (e) {
        console.error('❌ Error fatal:', e.message);
    } finally {
        if (connection) await connection.end();
    }
}

run();
