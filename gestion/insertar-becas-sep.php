<?php
require('config.php');

// Verificar que la tabla existe
$check_table = mysql_query("SHOW TABLES LIKE 'alumno_beca_sep'", $conn);
if (mysql_num_rows($check_table) == 0) {
    die('Error: La tabla alumno_beca_sep no existe. Por favor créala primero.');
}

// Limpiar registros anteriores del ciclo 22 (opcional, descomentar si quieres limpiar primero)
// mysql_query("DELETE FROM alumno_beca_sep WHERE ciclo_escolar = 22", $conn);

// Array de becas SEP 2025-2026
$integracionSEP = array();

// KINDER
$integracionSEP[] = [21592, 2795.63];
$integracionSEP[] = [21454, 2763.93];
$integracionSEP[] = [21538, 2565.00];
$integracionSEP[] = [21723, 2510.36];
$integracionSEP[] = [21472, 1455.50];
$integracionSEP[] = [21446, 2653.75];
$integracionSEP[] = [21393, 2523.44];
$integracionSEP[] = [21392, 1510.28];
$integracionSEP[] = [21465, 2350.61];
$integracionSEP[] = [21361, 1367.94];

// PRIMARIA
$integracionSEP[] = [21256, 3660.00];
$integracionSEP[] = [21191, 3660.00];
$integracionSEP[] = [21168, 3843.00];
$integracionSEP[] = [21489, 3650.00];
$integracionSEP[] = [21313, 3538.00];
$integracionSEP[] = [21195, 3904.00];
$integracionSEP[] = [21395, 3904.00];
$integracionSEP[] = [21177, 3904.00];
$integracionSEP[] = [21387, 3660.00];
$integracionSEP[] = [20958, 3843.00];
$integracionSEP[] = [21641, 3532.93];
$integracionSEP[] = [20774, 3485.71];
$integracionSEP[] = [21034, 3904.00];
$integracionSEP[] = [21740, 3758.77];
$integracionSEP[] = [20963, 3485.71];
$integracionSEP[] = [20767, 3532.93];
$integracionSEP[] = [20614, 3660.00];
$integracionSEP[] = [20376, 3799.43];
$integracionSEP[] = [20742, 3904.00];
$integracionSEP[] = [21106, 3660.00];
$integracionSEP[] = [21061, 3660.00];
$integracionSEP[] = [21120, 3660.00];
$integracionSEP[] = [21051, 3822.67];
$integracionSEP[] = [20460, 3520.00];
$integracionSEP[] = [21652, 3682.60];
$integracionSEP[] = [20636, 3795.56];
$integracionSEP[] = [20413, 3873.50];
$integracionSEP[] = [21310, 3715.93];
$integracionSEP[] = [20956, 3799.43];
$integracionSEP[] = [20278, 3774.35];
$integracionSEP[] = [20856, 2117.69];
$integracionSEP[] = [20057, 3843.00];
$integracionSEP[] = [21564, 3190.00];
$integracionSEP[] = [21605, 3324.44];
$integracionSEP[] = [21276, 3190.00];
$integracionSEP[] = [21433, 3437.50];
$integracionSEP[] = [21099, 3471.11];
$integracionSEP[] = [21406, 3190.00];
$integracionSEP[] = [20906, 3324.44];
$integracionSEP[] = [21451, 3190.00];
$integracionSEP[] = [20987, 3396.34];
$integracionSEP[] = [20482, 3384.00];
$integracionSEP[] = [21302, 3471.11];
$integracionSEP[] = [20960, 3520.00];
$integracionSEP[] = [21338, 3471.11];
$integracionSEP[] = [21214, 3190.00];
$integracionSEP[] = [21189, 3437.50];
$integracionSEP[] = [21347, 3324.44];
$integracionSEP[] = [21076, 3190.00];
$integracionSEP[] = [20716, 3190.00];
$integracionSEP[] = [20355, 3520.00];
$integracionSEP[] = [21312, 3520.00];
$integracionSEP[] = [20616, 3471.11];
$integracionSEP[] = [21014, 3190.00];
$integracionSEP[] = [21074, 3324.44];
$integracionSEP[] = [20874, 3520.00];
$integracionSEP[] = [20633, 3211.49];
$integracionSEP[] = [20529, 3324.44];
$integracionSEP[] = [21768, 3324.44];
$integracionSEP[] = [20669, 3734.57];
$integracionSEP[] = [20245, 3660.00];
$integracionSEP[] = [20920, 3170.59];
$integracionSEP[] = [21413, 3520.00];
$integracionSEP[] = [20457, 3062.93];
$integracionSEP[] = [21490, 3799.43];
$integracionSEP[] = [20527, 3520.00];

// SECUNDARIA
$integracionSEP[] = [20005, 4208.00];
$integracionSEP[] = [20140, 3757.14];
$integracionSEP[] = [11781, 3945.00];
$integracionSEP[] = [20380, 4208.00];
$integracionSEP[] = [20031, 3945.00];
$integracionSEP[] = [11785, 4142.25];
$integracionSEP[] = [21046, 4070.00];
$integracionSEP[] = [11767, 4208.00];
$integracionSEP[] = [20283, 3945.00];
$integracionSEP[] = [11528, 4208.00];
$integracionSEP[] = [20188, 4142.25];
$integracionSEP[] = [21084, 3757.14];
$integracionSEP[] = [21609, 3945.00];
$integracionSEP[] = [20646, 4208.00];
$integracionSEP[] = [21182, 3757.14];
$integracionSEP[] = [20971, 3611.56];
$integracionSEP[] = [20763, 3704.50];
$integracionSEP[] = [21709, 3611.56];
$integracionSEP[] = [20980, 3611.56];
$integracionSEP[] = [21098, 3488.89];
$integracionSEP[] = [21765, 3611.56];
$integracionSEP[] = [20428, 3382.13];
$integracionSEP[] = [20871, 3824.00];
$integracionSEP[] = [20761, 3691.22];
$integracionSEP[] = [21288, 3319.44];
$integracionSEP[] = [21328, 3728.40];
$integracionSEP[] = [20559, 3734.38];
$integracionSEP[] = [21326, 3611.55];
$integracionSEP[] = [11688, 3824.00];
$integracionSEP[] = [11862, 3270.60];
$integracionSEP[] = [21704, 3136.88];
$integracionSEP[] = [21422, 3945.00];
$integracionSEP[] = [20625, 1953.25];

// Configuración
$ciclo_escolar = 22; // 2025-2026
$fecha_inicio = '2025-11-01'; // Noviembre 2025
$estatus = 1; // Activo

// Contadores
$insertados = 0;
$errores = 0;
$duplicados = 0;
$no_encontrados = 0;

echo "<h1>Inserción de Becas SEP 2025-2026</h1>";
echo "<style>
    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
    h1 { color: #001f3f; }
    .success { color: green; font-weight: bold; }
    .error { color: red; font-weight: bold; }
    .warning { color: orange; font-weight: bold; }
    .info { background: white; padding: 15px; margin: 10px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    table { width: 100%; border-collapse: collapse; background: white; margin: 20px 0; }
    th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
    th { background: #001f3f; color: white; }
    tr:hover { background: #f9f9f9; }
</style>";

echo "<div class='info'>";
echo "<h2>Iniciando inserción...</h2>";
echo "<p>Total de registros a insertar: " . count($integracionSEP) . "</p>";
echo "<p>Ciclo Escolar: $ciclo_escolar (2025-2026)</p>";
echo "<p>Fecha de inicio: $fecha_inicio</p>";
echo "</div>";

// Insertar cada registro
foreach ($integracionSEP as $index => $beca) {
    $alumno_ref = (int)$beca[0];
    $monto = (float)$beca[1];
    
    // Verificar si el alumno_ref existe en la tabla alumno
    $check_alumno = mysql_query("SELECT alumno_id FROM alumno WHERE alumno_ref = $alumno_ref LIMIT 1", $conn);
    
    if (mysql_num_rows($check_alumno) == 0) {
        $no_encontrados++;
        echo "<p class='warning'>⚠️ Alumno con referencia $alumno_ref no encontrado en la tabla alumno</p>";
        continue;
    }
    
    // Verificar si ya existe el registro (evitar duplicados)
    $check_duplicado = mysql_query(
        "SELECT id FROM alumno_beca_sep 
         WHERE alumno_ref = $alumno_ref 
         AND ciclo_escolar = $ciclo_escolar 
         LIMIT 1", 
        $conn
    );
    
    if (mysql_num_rows($check_duplicado) > 0) {
        $duplicados++;
        echo "<p class='warning'>⚠️ Beca SEP ya existe para alumno_ref $alumno_ref (ciclo $ciclo_escolar)</p>";
        continue;
    }
    
    // Insertar el registro
    $query = sprintf(
        "INSERT INTO alumno_beca_sep (alumno_ref, ciclo_escolar, monto_prorrateado, fecha_inicio, estatus) 
         VALUES (%d, %d, %.2f, '%s', %d)",
        $alumno_ref,
        $ciclo_escolar,
        $monto,
        $fecha_inicio,
        $estatus
    );
    
    $result = mysql_query($query, $conn);
    
    if ($result) {
        $insertados++;
        echo "<p class='success'>✅ Insertado: alumno_ref $alumno_ref - Monto: $" . number_format($monto, 2) . "</p>";
    } else {
        $errores++;
        echo "<p class='error'>❌ Error al insertar alumno_ref $alumno_ref: " . mysql_error($conn) . "</p>";
    }
}

// Resumen final
echo "<div class='info' style='background: #e8f5e9; border-left: 4px solid #4caf50;'>";
echo "<h2>✅ Resumen de la inserción</h2>";
echo "<table>";
echo "<tr><th>Concepto</th><th>Cantidad</th></tr>";
echo "<tr><td>Registros insertados exitosamente</td><td class='success'>$insertados</td></tr>";
echo "<tr><td>Registros duplicados (omitidos)</td><td class='warning'>$duplicados</td></tr>";
echo "<tr><td>Alumnos no encontrados</td><td class='warning'>$no_encontrados</td></tr>";
echo "<tr><td>Errores de inserción</td><td class='error'>$errores</td></tr>";
echo "<tr><td><strong>Total procesado</strong></td><td><strong>" . count($integracionSEP) . "</strong></td></tr>";
echo "</table>";

// Verificar totales por nivel
echo "<h3>Verificación en base de datos:</h3>";
$total_bd = mysql_query("SELECT COUNT(*) as total FROM alumno_beca_sep WHERE ciclo_escolar = $ciclo_escolar", $conn);
$row_total = mysql_fetch_assoc($total_bd);
echo "<p>Total de becas SEP en BD (ciclo $ciclo_escolar): <strong>" . $row_total['total'] . "</strong></p>";

echo "<p style='margin-top: 20px; padding: 10px; background: #fff3cd; border-left: 4px solid #ffc107;'>";
echo "<strong>⚠️ IMPORTANTE:</strong> Elimina este archivo (insertar-becas-sep.php) después de ejecutarlo por seguridad.";
echo "</p>";

echo "</div>";

mysql_close($conn);
?>

