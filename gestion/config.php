<?php
// Configuración de la base de datos
$host = "localhost";
$username = "winston_richard";
$password = "101605";
$dbname = "winston_general";

// Crear conexión (compatible con PHP 5.1)
$conn = mysql_connect($host, $username, $password);

if (!$conn) {
    die("Error de conexión: " . mysql_error());
}

// Seleccionar base de datos
$db = mysql_select_db($dbname, $conn);

if (!$db) {
    die("Error al seleccionar base de datos: " . mysql_error());
}

// Configurar charset (importante para tildes y ñ)
mysql_query("SET NAMES 'utf8'", $conn);
?>

