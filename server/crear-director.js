/**
 * Script para crear la primera cuenta de Director
 * Uso: node crear-director.js
 * 
 * Este script se ejecuta una sola vez para inicializar
 * la cuenta del director de la escuela.
 */

const readline = require('readline');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function pregunta(texto) {
    return new Promise((resolve) => {
        rl.question(texto, (respuesta) => {
            resolve(respuesta.trim());
        });
    });
}

async function crearDirector() {
    console.log('\n╔══════════════════════════════════════════════╗');
    console.log('║   🏫 CREAR CUENTA DE DIRECTOR INICIAL       ║');
    console.log('║   Sistema de Control Escolar                 ║');
    console.log('╚══════════════════════════════════════════════╝\n');

    let connection;

    try {
        // Conectar a la base de datos
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ Conexión a la base de datos establecida\n');

        // Verificar si ya existe un director
        const [directores] = await connection.query(
            "SELECT id, nombre, email FROM usuarios WHERE rol = 'director' AND activo = TRUE"
        );

        if (directores.length > 0) {
            console.log('⚠️  Ya existe un director registrado:');
            directores.forEach(d => {
                console.log(`   → ${d.nombre} (${d.email})`);
            });

            const continuar = await pregunta('\n¿Deseas crear otro director de todas formas? (s/n): ');
            if (continuar.toLowerCase() !== 's') {
                console.log('\n❌ Operación cancelada.');
                return;
            }
        }

        // Solicitar datos
        console.log('📝 Ingresa los datos del director:\n');

        const nombre = await pregunta('   Nombre completo: ');
        if (!nombre || nombre.length < 2) {
            console.log('❌ El nombre debe tener al menos 2 caracteres.');
            return;
        }

        const email = await pregunta('   Correo electrónico: ');
        if (!email || !email.includes('@')) {
            console.log('❌ Email inválido.');
            return;
        }

        // Verificar que el email no esté en uso
        const [existente] = await connection.query(
            'SELECT id FROM usuarios WHERE email = ?', [email]
        );
        if (existente.length > 0) {
            console.log('❌ Ese email ya está registrado en el sistema.');
            return;
        }

        const password = await pregunta('   Contraseña (mínimo 6 caracteres): ');
        if (!password || password.length < 6) {
            console.log('❌ La contraseña debe tener al menos 6 caracteres.');
            return;
        }

        const confirmar = await pregunta('   Confirmar contraseña: ');
        if (password !== confirmar) {
            console.log('❌ Las contraseñas no coinciden.');
            return;
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insertar director
        const [resultado] = await connection.query(
            `INSERT INTO usuarios (nombre, email, password, rol, activo) VALUES (?, ?, ?, 'director', TRUE)`,
            [nombre, email, passwordHash]
        );

        console.log('\n╔══════════════════════════════════════════════╗');
        console.log('║   ✅ ¡DIRECTOR CREADO EXITOSAMENTE!          ║');
        console.log('╚══════════════════════════════════════════════╝');
        console.log(`\n   👤 Nombre:  ${nombre}`);
        console.log(`   📧 Email:   ${email}`);
        console.log(`   🔑 Rol:     Director`);
        console.log(`   🆔 ID:      ${resultado.insertId}`);
        console.log('\n   📌 El director puede iniciar sesión en el sistema');
        console.log('   📌 y crear cuentas para los maestros desde');
        console.log('   📌 la sección "Usuarios".\n');

    } catch (error) {
        if (error.code === 'ECONNREFUSED') {
            console.log('❌ No se pudo conectar a la base de datos.');
            console.log('   Verifica que MySQL esté corriendo (XAMPP/MySQL).');
        } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('❌ Credenciales de base de datos incorrectas.');
            console.log('   Revisa DB_USER y DB_PASSWORD en el archivo .env');
        } else {
            console.log('❌ Error:', error.message);
        }
    } finally {
        if (connection) await connection.end();
        rl.close();
    }
}

crearDirector();
