<?php
require('config.php');

echo "<h1>Estructura de la tabla pago_detalle</h1>";
echo "<style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
    h1 { color: #001f3f; }
    .info { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    table { width: 100%; border-collapse: collapse; background: white; margin: 20px 0; }
    th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
    th { background: #001f3f; color: white; }
    tr:hover { background: #f9f9f9; }
    .success { color: green; font-weight: bold; }
    .error { color: red; font-weight: bold; }
</style>";

// Verificar si la tabla existe
echo "<div class='info'>";
echo "<h2>1. Verificando si la tabla existe...</h2>";
$check_table = mysql_query("SHOW TABLES LIKE 'pago_detalle'", $conn);

if (mysql_num_rows($check_table) == 0) {
    echo "<p class='error'>❌ La tabla 'pago_detalle' NO existe</p>";
    mysql_close($conn);
    die();
} else {
    echo "<p class='success'>✅ La tabla 'pago_detalle' existe</p>";
}
echo "</div>";

// Mostrar estructura de la tabla
echo "<div class='info'>";
echo "<h2>2. Estructura de la tabla 'pago_detalle':</h2>";
$structure = mysql_query("DESCRIBE pago_detalle", $conn);

if ($structure) {
    echo "<table>";
    echo "<tr><th>Columna</th><th>Tipo</th><th>Nulo</th><th>Clave</th><th>Default</th><th>Extra</th></tr>";
    
    while ($col = mysql_fetch_assoc($structure)) {
        echo "<tr>";
        echo "<td><strong>" . htmlspecialchars($col['Field']) . "</strong></td>";
        echo "<td>" . htmlspecialchars($col['Type']) . "</td>";
        echo "<td>" . htmlspecialchars($col['Null']) . "</td>";
        echo "<td>" . htmlspecialchars($col['Key']) . "</td>";
        echo "<td>" . ($col['Default'] ? htmlspecialchars($col['Default']) : 'NULL') . "</td>";
        echo "<td>" . htmlspecialchars($col['Extra']) . "</td>";
        echo "</tr>";
    }
    
    echo "</table>";
} else {
    echo "<p class='error'>❌ Error al obtener estructura: " . mysql_error($conn) . "</p>";
}
echo "</div>";

// Mostrar algunos registros de ejemplo
echo "<div class='info'>";
echo "<h2>3. Primeros 5 registros de ejemplo:</h2>";
$sample = mysql_query("SELECT * FROM pago_detalle LIMIT 5", $conn);

if ($sample && mysql_num_rows($sample) > 0) {
    echo "<table>";
    
    // Headers
    echo "<tr>";
    $firstRow = mysql_fetch_assoc($sample);
    foreach ($firstRow as $key => $value) {
        echo "<th>" . htmlspecialchars($key) . "</th>";
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
    echo "<p class='error'>⚠️ La tabla 'pago_detalle' está vacía o no se pudieron obtener registros</p>";
}
echo "</div>";

// Analizar formato de pago_referencia
echo "<div class='info'>";
echo "<h2>4. Análisis del campo 'pago_referencia':</h2>";
$refs = mysql_query("SELECT DISTINCT pago_referencia FROM pago_detalle WHERE pago_referencia IS NOT NULL LIMIT 10", $conn);

if ($refs && mysql_num_rows($refs) > 0) {
    echo "<table>";
    echo "<tr><th>pago_referencia</th><th>Longitud</th><th>Posición 6-7 (Concepto)</th><th>Posición 8-9 (Ciclo)</th></tr>";
    
    while ($ref = mysql_fetch_assoc($refs)) {
        $ref_value = $ref['pago_referencia'];
        $len = strlen($ref_value);
        $concepto = substr($ref_value, 5, 2); // Posición 6-7 (índice 5-6)
        $ciclo = substr($ref_value, 7, 2);     // Posición 8-9 (índice 7-8)
        
        echo "<tr>";
        echo "<td><strong>" . htmlspecialchars($ref_value) . "</strong></td>";
        echo "<td>" . $len . "</td>";
        echo "<td>" . htmlspecialchars($concepto) . "</td>";
        echo "<td>" . htmlspecialchars($ciclo) . "</td>";
        echo "</tr>";
    }
    
    echo "</table>";
    echo "<p><strong>Nota:</strong> En el código se usa SUBSTR(pago_referencia, 6, 2) para el concepto y SUBSTR(pago_referencia, 8, 2) para el ciclo.</p>";
} else {
    echo "<p class='error'>⚠️ No se encontraron registros con pago_referencia</p>";
}
echo "</div>";

// Contar total de registros
echo "<div class='info'>";
echo "<h2>5. Estadísticas:</h2>";
$total = mysql_query("SELECT COUNT(*) as total FROM pago_detalle", $conn);
$totalRow = mysql_fetch_assoc($total);
echo "<p>Total de registros: <strong>" . $totalRow['total'] . "</strong></p>";

$con_ciclo22 = mysql_query("SELECT COUNT(*) as total FROM pago_detalle WHERE SUBSTR(pago_referencia, 8, 2) = '22'", $conn);
$ciclo22Row = mysql_fetch_assoc($con_ciclo22);
echo "<p>Registros del ciclo 22: <strong>" . $ciclo22Row['total'] . "</strong></p>";
echo "</div>";

mysql_close($conn);

echo "<div class='info' style='background: #e8f5e9; border-left: 4px solid #4caf50;'>";
echo "<h2>✅ Análisis completado</h2>";
echo "<p><strong>⚠️ IMPORTANTE:</strong> Elimina este archivo después de revisarlo por seguridad.</p>";
echo "</div>";
?>

