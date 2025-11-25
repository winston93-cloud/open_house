<?php
// Archivo de prueba para verificar la conexión y estructura de la base de datos

$host = "localhost";
$username = "winston_richard";
$password = "101605";
$dbname = "winston_general";

echo "<h1>Test de Conexión - Winston Churchill</h1>";
echo "<style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
    h1 { color: #001f3f; }
    .success { color: green; font-weight: bold; }
    .error { color: red; font-weight: bold; }
    .info { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    table { width: 100%; border-collapse: collapse; background: white; margin: 20px 0; }
    th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
    th { background: #001f3f; color: white; }
    tr:hover { background: #f9f9f9; }
</style>";

// 1. Probar conexión
echo "<div class='info'>";
echo "<h2>1. Probando conexión a MySQL...</h2>";
$conn = @mysql_connect($host, $username, $password);

if (!$conn) {
    echo "<p class='error'>❌ Error de conexión: " . mysql_error() . "</p>";
    die();
} else {
    echo "<p class='success'>✅ Conexión exitosa al servidor MySQL</p>";
}

// 2. Seleccionar base de datos
echo "<h2>2. Seleccionando base de datos...</h2>";
$db = @mysql_select_db($dbname, $conn);

if (!$db) {
    echo "<p class='error'>❌ Error al seleccionar base de datos: " . mysql_error() . "</p>";
    die();
} else {
    echo "<p class='success'>✅ Base de datos '$dbname' seleccionada correctamente</p>";
}

mysql_query("SET NAMES 'utf8'", $conn);
echo "</div>";

// 3. Mostrar todas las tablas
echo "<div class='info'>";
echo "<h2>3. Tablas en la base de datos:</h2>";
$result = mysql_query("SHOW TABLES", $conn);

if ($result) {
    echo "<table>";
    echo "<tr><th>Nombre de la Tabla</th><th>Total Registros</th></tr>";
    
    while ($row = mysql_fetch_array($result)) {
        $tableName = $row[0];
        
        // Contar registros
        $countResult = mysql_query("SELECT COUNT(*) as total FROM `$tableName`", $conn);
        $countRow = mysql_fetch_assoc($countResult);
        $count = $countRow['total'];
        
        echo "<tr>";
        echo "<td><strong>$tableName</strong></td>";
        echo "<td>$count registros</td>";
        echo "</tr>";
    }
    
    echo "</table>";
} else {
    echo "<p class='error'>❌ Error al obtener tablas: " . mysql_error() . "</p>";
}
echo "</div>";

// 4. Verificar si existe la tabla 'alumno'
echo "<div class='info'>";
echo "<h2>4. Estructura de la tabla 'alumno':</h2>";
$checkTable = mysql_query("SHOW TABLES LIKE 'alumno'", $conn);

if (mysql_num_rows($checkTable) > 0) {
    echo "<p class='success'>✅ La tabla 'alumno' existe</p>";
    
    // Mostrar estructura
    $structure = mysql_query("DESCRIBE alumno", $conn);
    
    if ($structure) {
        echo "<table>";
        echo "<tr><th>Columna</th><th>Tipo</th><th>Nulo</th><th>Clave</th><th>Default</th></tr>";
        
        while ($col = mysql_fetch_assoc($structure)) {
            echo "<tr>";
            echo "<td><strong>" . $col['Field'] . "</strong></td>";
            echo "<td>" . $col['Type'] . "</td>";
            echo "<td>" . $col['Null'] . "</td>";
            echo "<td>" . $col['Key'] . "</td>";
            echo "<td>" . ($col['Default'] ? $col['Default'] : '-') . "</td>";
            echo "</tr>";
        }
        
        echo "</table>";
        
        // Mostrar 5 registros de ejemplo
        echo "<h3>Primeros 5 registros de ejemplo:</h3>";
        $sample = mysql_query("SELECT * FROM alumno LIMIT 5", $conn);
        
        if (mysql_num_rows($sample) > 0) {
            echo "<table>";
            
            // Headers
            echo "<tr>";
            $firstRow = mysql_fetch_assoc($sample);
            foreach ($firstRow as $key => $value) {
                echo "<th>$key</th>";
            }
            echo "</tr>";
            
            // Primera fila
            echo "<tr>";
            foreach ($firstRow as $value) {
                echo "<td>" . htmlspecialchars($value) . "</td>";
            }
            echo "</tr>";
            
            // Resto de filas
            while ($row = mysql_fetch_assoc($sample)) {
                echo "<tr>";
                foreach ($row as $value) {
                    echo "<td>" . htmlspecialchars($value) . "</td>";
                }
                echo "</tr>";
            }
            
            echo "</table>";
        } else {
            echo "<p class='error'>⚠️ La tabla 'alumno' está vacía</p>";
        }
    }
    
} else {
    echo "<p class='error'>❌ La tabla 'alumno' NO existe</p>";
    echo "<p>💡 Verifica el nombre de la tabla en phpMyAdmin</p>";
}
echo "</div>";

// 5. Contar alumnos por nivel
echo "<div class='info'>";
echo "<h2>5. Alumnos por nivel:</h2>";
$levels = mysql_query("SELECT nivel, COUNT(*) as total FROM alumno GROUP BY nivel ORDER BY nivel", $conn);

if ($levels && mysql_num_rows($levels) > 0) {
    echo "<table>";
    echo "<tr><th>Nivel</th><th>Total Alumnos</th></tr>";
    
    while ($level = mysql_fetch_assoc($levels)) {
        echo "<tr>";
        echo "<td><strong>" . htmlspecialchars($level['nivel']) . "</strong></td>";
        echo "<td>" . $level['total'] . "</td>";
        echo "</tr>";
    }
    
    echo "</table>";
} else {
    echo "<p class='error'>⚠️ No se encontraron niveles o la columna 'nivel' no existe</p>";
}
echo "</div>";

mysql_close($conn);

echo "<div class='info' style='background: #e8f5e9; border-left: 4px solid #4caf50;'>";
echo "<h2>✅ Prueba completada</h2>";
echo "<p><strong>Siguiente paso:</strong> Sube la carpeta 'gestion' al hosting y accede desde el navegador.</p>";
echo "<p><strong>⚠️ IMPORTANTE:</strong> Elimina este archivo (test-conexion.php) después de probarlo por seguridad.</p>";
echo "</div>";
?>

