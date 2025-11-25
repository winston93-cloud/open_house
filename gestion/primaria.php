<?php
include('config.php');

// Obtener todos los alumnos de Primaria
$query = "SELECT * FROM alumno WHERE nivel = 'Primaria' ORDER BY grado ASC, nombre ASC";
$result = mysql_query($query, $conn);

if (!$result) {
    die("Error en la consulta: " . mysql_error());
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Primaria - Gestión Administrativa</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="page-container">
        <div class="page-header">
            <a href="index.php" class="back-button">← Regresar</a>
            <h1>📚 Primaria</h1>
        </div>

        <div class="content-wrapper">
            <div class="stats-bar">
                <div class="stat-item">
                    <span class="stat-number"><?php echo mysql_num_rows($result); ?></span>
                    <span class="stat-label">Total Alumnos</span>
                </div>
                <div class="stat-item">
                    <button onclick="window.print()" class="btn-print">🖨️ Imprimir</button>
                </div>
            </div>

            <div class="table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Grado</th>
                            <th>Edad</th>
                            <th>Tutor</th>
                            <th>Teléfono</th>
                            <th>Email</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        if (mysql_num_rows($result) > 0) {
                            while ($row = mysql_fetch_assoc($result)) {
                                echo "<tr>";
                                echo "<td>" . htmlspecialchars($row['nombre']) . "</td>";
                                echo "<td>" . htmlspecialchars($row['grado']) . "</td>";
                                echo "<td>" . (isset($row['edad']) ? $row['edad'] : '-') . "</td>";
                                echo "<td>" . (isset($row['tutor']) ? htmlspecialchars($row['tutor']) : '-') . "</td>";
                                echo "<td>" . (isset($row['telefono']) ? htmlspecialchars($row['telefono']) : '-') . "</td>";
                                echo "<td>" . (isset($row['email']) ? htmlspecialchars($row['email']) : '-') . "</td>";
                                echo "</tr>";
                            }
                        } else {
                            echo "<tr><td colspan='6' class='no-data'>No hay alumnos registrados</td></tr>";
                        }
                        ?>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</body>
</html>
<?php
mysql_close($conn);
?>

