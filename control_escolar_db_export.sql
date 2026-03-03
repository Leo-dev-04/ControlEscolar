-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: control_escolar_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `alumnos`
--

DROP TABLE IF EXISTS `alumnos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `alumnos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellidos` varchar(100) NOT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `grupo_id` int(11) NOT NULL,
  `parent_email` varchar(255) NOT NULL,
  `parent_nombre` varchar(100) DEFAULT NULL,
  `parent_telefono` varchar(20) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_grupo` (`grupo_id`),
  KEY `idx_activo` (`activo`),
  KEY `idx_parent_email` (`parent_email`),
  KEY `idx_apellidos` (`apellidos`),
  CONSTRAINT `alumnos_ibfk_1` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alumnos`
--

LOCK TABLES `alumnos` WRITE;
/*!40000 ALTER TABLE `alumnos` DISABLE KEYS */;
INSERT INTO `alumnos` VALUES (1,'Juan','Perez Lopez','2018-03-15',1,'lg341154@gmail.com','Roberto Perez','7461301992',1,'2026-02-11 23:18:01'),(2,'Martha','Lopez Hernandez','2018-06-20',1,'laura@gmail.com','Laura Hernandez','7461301992',1,'2026-02-11 23:18:01'),(3,'Pedro','Martinez Silva','2017-09-10',2,'papapedro@gmail.com','Jose Martinez','7461301992',1,'2026-02-11 23:18:01'),(4,'Ana','González Ruiz','2017-12-05',2,'mamaana@gmail.com','Carmen Ruiz','7461301992',1,'2026-02-11 23:18:01'),(5,'Luis','Ramirez Torres','2016-04-18',3,'papaluis@gmail.com','Miguel Ramirez Gonzalez','7461301992',1,'2026-02-11 23:18:01'),(6,'Leo','Gonzalez Tolentino','2004-03-15',4,'lg341154@gmail.com','Roberto Gonzalez','7461301992',1,'2026-02-12 18:12:26');
/*!40000 ALTER TABLE `alumnos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `asistencias`
--

DROP TABLE IF EXISTS `asistencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `asistencias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `alumno_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `estado` enum('presente','falta','retardo') DEFAULT 'presente',
  `observaciones` text DEFAULT NULL,
  `registrado_por` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_alumno_fecha` (`alumno_id`,`fecha`),
  KEY `registrado_por` (`registrado_por`),
  KEY `idx_fecha` (`fecha`),
  KEY `idx_alumno_fecha` (`alumno_id`,`fecha`),
  KEY `idx_estado` (`estado`),
  CONSTRAINT `asistencias_ibfk_1` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `asistencias_ibfk_2` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `asistencias`
--

LOCK TABLES `asistencias` WRITE;
/*!40000 ALTER TABLE `asistencias` DISABLE KEYS */;
INSERT INTO `asistencias` VALUES (2,6,'2026-02-12','presente',NULL,4,'2026-02-12 18:28:55'),(3,6,'2026-02-14','presente',NULL,4,'2026-02-14 17:12:19'),(4,6,'2026-02-24','retardo',NULL,4,'2026-02-24 02:50:50'),(5,6,'2026-02-27','presente',NULL,4,'2026-02-27 02:47:04');
/*!40000 ALTER TABLE `asistencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `conducta`
--

DROP TABLE IF EXISTS `conducta`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `conducta` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `alumno_id` int(11) NOT NULL,
  `fecha` date NOT NULL,
  `color` enum('verde','amarillo','rojo') DEFAULT 'verde',
  `observaciones` text DEFAULT NULL,
  `registrado_por` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_alumno_fecha` (`alumno_id`,`fecha`),
  KEY `registrado_por` (`registrado_por`),
  KEY `idx_fecha` (`fecha`),
  KEY `idx_alumno_fecha` (`alumno_id`,`fecha`),
  KEY `idx_color` (`color`),
  CONSTRAINT `conducta_ibfk_1` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `conducta_ibfk_2` FOREIGN KEY (`registrado_por`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `conducta`
--

LOCK TABLES `conducta` WRITE;
/*!40000 ALTER TABLE `conducta` DISABLE KEYS */;
INSERT INTO `conducta` VALUES (2,6,'2026-02-12','verde',NULL,4,'2026-02-12 18:31:08'),(3,6,'2026-02-14','amarillo',NULL,4,'2026-02-14 17:12:52'),(4,6,'2026-02-24','amarillo',NULL,4,'2026-02-24 02:51:16'),(5,6,'2026-02-27','amarillo',NULL,4,'2026-02-27 02:47:12');
/*!40000 ALTER TABLE `conducta` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_log`
--

DROP TABLE IF EXISTS `email_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `email_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `reporte_id` int(11) NOT NULL,
  `destinatario` varchar(255) NOT NULL,
  `asunto` varchar(255) NOT NULL,
  `enviado` tinyint(1) DEFAULT 0,
  `fecha_envio` timestamp NULL DEFAULT NULL,
  `error` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_reporte` (`reporte_id`),
  KEY `idx_enviado` (`enviado`),
  KEY `idx_fecha_envio` (`fecha_envio`),
  CONSTRAINT `email_log_ibfk_1` FOREIGN KEY (`reporte_id`) REFERENCES `reportes_semanales` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_log`
--

LOCK TABLES `email_log` WRITE;
/*!40000 ALTER TABLE `email_log` DISABLE KEYS */;
INSERT INTO `email_log` VALUES (7,6,'lg341154@gmail.com','Reporte Semanal',1,'2026-02-24 02:51:25',NULL,'2026-02-24 02:51:25'),(8,6,'lg341154@gmail.com','Reporte Semanal',1,'2026-02-24 03:09:44',NULL,'2026-02-24 03:09:44'),(9,6,'lg341154@gmail.com','Reporte Semanal',1,'2026-02-24 03:13:11',NULL,'2026-02-24 03:13:11'),(10,6,'lg341154@gmail.com','Reporte Semanal',1,'2026-02-24 03:19:06',NULL,'2026-02-24 03:19:06'),(11,6,'lg341154@gmail.com','Reporte Semanal',1,'2026-02-27 02:47:29',NULL,'2026-02-27 02:47:29');
/*!40000 ALTER TABLE `email_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `entregas_tareas`
--

DROP TABLE IF EXISTS `entregas_tareas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `entregas_tareas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tarea_id` int(11) NOT NULL,
  `alumno_id` int(11) NOT NULL,
  `entregada` tinyint(1) DEFAULT 1,
  `fecha_entrega` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `observaciones` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_tarea_alumno` (`tarea_id`,`alumno_id`),
  KEY `idx_alumno` (`alumno_id`),
  KEY `idx_tarea` (`tarea_id`),
  CONSTRAINT `entregas_tareas_ibfk_1` FOREIGN KEY (`tarea_id`) REFERENCES `tareas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `entregas_tareas_ibfk_2` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `entregas_tareas`
--

LOCK TABLES `entregas_tareas` WRITE;
/*!40000 ALTER TABLE `entregas_tareas` DISABLE KEYS */;
INSERT INTO `entregas_tareas` VALUES (1,10,6,0,'2026-02-12 18:31:04',NULL,'2026-02-12 18:31:04'),(2,11,6,1,'2026-02-14 17:12:44',NULL,'2026-02-14 17:12:44'),(3,12,6,1,'2026-02-24 02:51:07',NULL,'2026-02-24 02:51:07'),(4,13,6,1,'2026-02-27 02:47:00',NULL,'2026-02-27 02:47:00');
/*!40000 ALTER TABLE `entregas_tareas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grupos`
--

DROP TABLE IF EXISTS `grupos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `grupos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) NOT NULL,
  `escuela` varchar(100) DEFAULT 'Gabino Barreda',
  `grado` int(11) NOT NULL,
  `seccion` varchar(10) NOT NULL,
  `maestro_id` int(11) DEFAULT NULL,
  `ciclo_escolar` varchar(20) DEFAULT '2025-2026',
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_grado_seccion` (`grado`,`seccion`),
  KEY `idx_maestro` (`maestro_id`),
  KEY `idx_activo` (`activo`),
  CONSTRAINT `grupos_ibfk_1` FOREIGN KEY (`maestro_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grupos`
--

LOCK TABLES `grupos` WRITE;
/*!40000 ALTER TABLE `grupos` DISABLE KEYS */;
INSERT INTO `grupos` VALUES (1,'Primero A','Gabino Barreda',1,'A',2,'2025-2026',1,'2026-02-11 23:18:01'),(2,'Segundo B','Gabino Barreda',2,'B',3,'2025-2026',0,'2026-02-11 23:18:01'),(3,'Tercero A','Gabino Barreda',3,'A',2,'2025-2026',1,'2026-02-11 23:18:01'),(4,'1° A','Luis Donaldo Colosio',1,'A',4,'2025-2026',1,'2026-02-12 17:57:26');
/*!40000 ALTER TABLE `grupos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reportes_semanales`
--

DROP TABLE IF EXISTS `reportes_semanales`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `reportes_semanales` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `alumno_id` int(11) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `total_asistencias` int(11) DEFAULT 0,
  `total_faltas` int(11) DEFAULT 0,
  `total_retardos` int(11) DEFAULT 0,
  `total_tareas` int(11) DEFAULT 0,
  `tareas_entregadas` int(11) DEFAULT 0,
  `conducta_verde` int(11) DEFAULT 0,
  `conducta_amarillo` int(11) DEFAULT 0,
  `conducta_rojo` int(11) DEFAULT 0,
  `observaciones_conducta` text DEFAULT NULL,
  `fecha_envio` timestamp NULL DEFAULT NULL,
  `enviado` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_alumno_fecha_inicio` (`alumno_id`,`fecha_inicio`),
  KEY `idx_alumno` (`alumno_id`),
  KEY `idx_fecha_inicio` (`fecha_inicio`),
  KEY `idx_enviado` (`enviado`),
  CONSTRAINT `reportes_semanales_ibfk_1` FOREIGN KEY (`alumno_id`) REFERENCES `alumnos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reportes_semanales`
--

LOCK TABLES `reportes_semanales` WRITE;
/*!40000 ALTER TABLE `reportes_semanales` DISABLE KEYS */;
INSERT INTO `reportes_semanales` VALUES (6,6,'2026-02-24','2026-02-28',1,0,0,2,2,0,2,0,'','2026-02-27 02:47:29',1,'2026-02-24 02:51:24');
/*!40000 ALTER TABLE `reportes_semanales` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tareas`
--

DROP TABLE IF EXISTS `tareas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `tareas` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `grupo_id` int(11) NOT NULL,
  `titulo` varchar(200) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `fecha_asignacion` date NOT NULL,
  `fecha_entrega` date NOT NULL,
  `maestro_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `maestro_id` (`maestro_id`),
  KEY `idx_grupo` (`grupo_id`),
  KEY `idx_fecha_entrega` (`fecha_entrega`),
  KEY `idx_grupo_fecha` (`grupo_id`,`fecha_entrega`),
  CONSTRAINT `tareas_ibfk_1` FOREIGN KEY (`grupo_id`) REFERENCES `grupos` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tareas_ibfk_2` FOREIGN KEY (`maestro_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tareas`
--

LOCK TABLES `tareas` WRITE;
/*!40000 ALTER TABLE `tareas` DISABLE KEYS */;
INSERT INTO `tareas` VALUES (1,4,'Maqueta','Maqueta del Sistema Solar','2026-02-12','2026-02-12',4,'2026-02-12 18:13:03'),(2,4,'Maqueta del sistema solar','Maqueta','2026-02-12','2026-02-12',4,'2026-02-12 18:20:43'),(3,4,'Maqueta Sistema','Mqueue','2026-02-12','2026-02-12',4,'2026-02-12 18:22:46'),(4,4,'eerf','deeeff','2026-02-12','2026-02-12',4,'2026-02-12 18:22:54'),(5,4,'dfdfd','fdfdfdfd','2026-02-12','2026-02-12',4,'2026-02-12 18:25:54'),(6,4,'trthyhg','ghhhyhyhyjy','2026-02-12','2026-02-12',4,'2026-02-12 18:26:13'),(7,4,'trthyhg','ghhhyhyhyjy','2026-02-12','2026-02-12',4,'2026-02-12 18:26:16'),(8,1,'Tarea prueba',NULL,'2026-02-12','2026-02-13',4,'2026-02-12 18:27:41'),(9,4,'mkjk','jkjkkjk','2026-02-12','2026-02-12',4,'2026-02-12 18:29:09'),(10,4,'mkjk','jkjkkjk','2026-02-12','2026-02-12',4,'2026-02-12 18:31:04'),(11,4,'Maqueta','Volcán','2026-02-14','2026-02-14',4,'2026-02-14 17:12:44'),(12,4,'Maqueta','Maqueta','2026-02-24','2026-02-24',4,'2026-02-24 02:51:07'),(13,4,'nnvvb','bvvbvb','2026-02-27','2026-02-27',4,'2026-02-27 02:47:00');
/*!40000 ALTER TABLE `tareas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('admin','maestro','director') NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_rol` (`rol`),
  KEY `idx_activo` (`activo`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Administrador','admin@escuela.com','$2a$10$eJF8Qwwr.Zht.jzDOorxAOi4RLH6b1B2QsPnPJbICwQlOtISPk9dC','admin',1,'2026-02-11 23:18:01'),(2,'Ana García','ana.garcia@escuela.com','$2a$10$szoZkOVgm6fs5BpVqRs3S.dStf7XQ2HaHy2ARrYgCroH0I6rBKsxe','director',1,'2026-02-11 23:18:01'),(3,'Ezequiel Hernández Meza','Ezequiel.Meza@escuela.com','123456','director',1,'2026-02-11 23:18:01'),(4,'Leo Gonzalez Tolentino','lg341154@gmail.com','$2a$10$T1yty6GRVxD6xW37LXGHNup2UfSFcBMDbkpF3MFYK8JvUoCG6M8Wy','maestro',1,'2026-02-12 17:57:05');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-02 20:56:35
