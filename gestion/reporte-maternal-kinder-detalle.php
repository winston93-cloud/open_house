<?php
require('fpdf.php');
require('config.php');

// Configuración del PDF
class PDF extends FPDF {
    function Header() {
        $this->SetFont('Arial', 'B', 16);
        $this->Cell(0, 10, 'Educativo Winston', 0, 1, 'C');
        $this->SetFont('Arial', 'B', 14);
        $this->Cell(0, 10, utf8_decode('Reporte Detallado de Becas - Ciclo Escolar 2025-2026'), 0, 1, 'C');
        $this->Ln(5);
    }
    
    function Footer() {
        $this->SetY(-15);
        $this->SetFont('Arial', 'I', 8);
        $this->Cell(0, 10, utf8_decode('Página ') . $this->PageNo(), 0, 0, 'C');
    }
}

function obtenerNombreGrado($nivel, $grado) {
    if ($nivel == 1) {
        // Maternal
        if ($grado == 1) return "Maternal A";
        if ($grado == 2) return "Maternal B";
    } elseif ($nivel == 2) {
        // Kinder
        return "Kinder-" . $grado;
    }
    return $grado;
}

$pdf = new PDF();
$pdf->AddPage();
$pdf->SetFont('Arial', '', 12);

// ========== MATERNAL ==========
$pdf->SetFillColor(255, 215, 0);
$pdf->SetFont('Arial', 'B', 14);
$pdf->Cell(0, 10, 'MATERNAL', 1, 1, 'C', true);
$pdf->Ln(3);

// Obtener porcentajes únicos
$query_porcentajes = "
    SELECT DISTINCT ab.beca_porcentaje
    FROM alumno a
    INNER JOIN alumno_beca ab ON a.alumno_id = ab.alumno_id
    WHERE a.alumno_nivel = 1
        AND a.alumno_ciclo_escolar = 22
        AND a.alumno_status = 1
        AND ab.beca_ciclo_escolar = 22
        AND ab.beca_estatus = 1
    ORDER BY ab.beca_porcentaje ASC
";

$result_porcentajes = mysql_query($query_porcentajes, $conn);
$total_maternal = 0;

if ($result_porcentajes && mysql_num_rows($result_porcentajes) > 0) {
    while ($row_porc = mysql_fetch_assoc($result_porcentajes)) {
        $porcentaje = $row_porc['beca_porcentaje'];
        
        // Obtener alumnos de este porcentaje
        $query_alumnos = "
            SELECT 
                CONCAT(a.alumno_nombre, ' ', a.alumno_app, ' ', a.alumno_apm) as nombre_completo,
                a.alumno_grado
            FROM alumno a
            INNER JOIN alumno_beca ab ON a.alumno_id = ab.alumno_id
            WHERE a.alumno_nivel = 1
                AND a.alumno_ciclo_escolar = 22
                AND a.alumno_status = 1
                AND ab.beca_ciclo_escolar = 22
                AND ab.beca_estatus = 1
                AND ab.beca_porcentaje = $porcentaje
            ORDER BY a.alumno_nombre ASC
        ";
        
        $result_alumnos = mysql_query($query_alumnos, $conn);
        $count = mysql_num_rows($result_alumnos);
        $total_maternal += $count;
        
        // Encabezado del porcentaje
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->SetFillColor(200, 220, 255);
        $pdf->Cell(0, 8, 'Beca: ' . $porcentaje . '% - Total: ' . $count . ' alumnos', 1, 1, 'L', true);
        
        // Listar alumnos
        $pdf->SetFont('Arial', '', 10);
        while ($alumno = mysql_fetch_assoc($result_alumnos)) {
            $grado_texto = obtenerNombreGrado(1, $alumno['alumno_grado']);
            $pdf->Cell(10, 6, '', 0, 0);
            $pdf->Cell(0, 6, utf8_decode('- ' . $alumno['nombre_completo'] . ' - ' . $grado_texto), 0, 1);
        }
        
        $pdf->Ln(3);
    }
    
    // Total Maternal
    $pdf->SetFont('Arial', 'B', 12);
    $pdf->SetFillColor(255, 255, 200);
    $pdf->Cell(0, 8, 'TOTAL MATERNAL: ' . $total_maternal . ' alumnos', 1, 1, 'C', true);
} else {
    $pdf->SetFont('Arial', 'I', 11);
    $pdf->Cell(0, 8, utf8_decode('No hay alumnos con beca en Maternal'), 1, 1, 'C');
}

$pdf->Ln(8);

// ========== KINDER ==========
$pdf->SetFillColor(255, 215, 0);
$pdf->SetFont('Arial', 'B', 14);
$pdf->Cell(0, 10, 'KINDER', 1, 1, 'C', true);
$pdf->Ln(3);

$query_porcentajes = "
    SELECT DISTINCT ab.beca_porcentaje
    FROM alumno a
    INNER JOIN alumno_beca ab ON a.alumno_id = ab.alumno_id
    WHERE a.alumno_nivel = 2
        AND a.alumno_ciclo_escolar = 22
        AND a.alumno_status = 1
        AND ab.beca_ciclo_escolar = 22
        AND ab.beca_estatus = 1
    ORDER BY ab.beca_porcentaje ASC
";

$result_porcentajes = mysql_query($query_porcentajes, $conn);
$total_kinder = 0;

if ($result_porcentajes && mysql_num_rows($result_porcentajes) > 0) {
    while ($row_porc = mysql_fetch_assoc($result_porcentajes)) {
        $porcentaje = $row_porc['beca_porcentaje'];
        
        $query_alumnos = "
            SELECT 
                CONCAT(a.alumno_nombre, ' ', a.alumno_app, ' ', a.alumno_apm) as nombre_completo,
                a.alumno_grado
            FROM alumno a
            INNER JOIN alumno_beca ab ON a.alumno_id = ab.alumno_id
            WHERE a.alumno_nivel = 2
                AND a.alumno_ciclo_escolar = 22
                AND a.alumno_status = 1
                AND ab.beca_ciclo_escolar = 22
                AND ab.beca_estatus = 1
                AND ab.beca_porcentaje = $porcentaje
            ORDER BY a.alumno_nombre ASC
        ";
        
        $result_alumnos = mysql_query($query_alumnos, $conn);
        $count = mysql_num_rows($result_alumnos);
        $total_kinder += $count;
        
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->SetFillColor(200, 220, 255);
        $pdf->Cell(0, 8, 'Beca: ' . $porcentaje . '% - Total: ' . $count . ' alumnos', 1, 1, 'L', true);
        
        $pdf->SetFont('Arial', '', 10);
        while ($alumno = mysql_fetch_assoc($result_alumnos)) {
            $grado_texto = obtenerNombreGrado(2, $alumno['alumno_grado']);
            $pdf->Cell(10, 6, '', 0, 0);
            $pdf->Cell(0, 6, utf8_decode('- ' . $alumno['nombre_completo'] . ' - ' . $grado_texto), 0, 1);
        }
        
        $pdf->Ln(3);
    }
    
    $pdf->SetFont('Arial', 'B', 12);
    $pdf->SetFillColor(255, 255, 200);
    $pdf->Cell(0, 8, 'TOTAL KINDER: ' . $total_kinder . ' alumnos', 1, 1, 'C', true);
} else {
    $pdf->SetFont('Arial', 'I', 11);
    $pdf->Cell(0, 8, 'No hay alumnos con beca en Kinder', 1, 1, 'C');
}

mysql_close($conn);
$pdf->Output('I', 'Reporte_Detallado_Maternal_Kinder.pdf');
?>

