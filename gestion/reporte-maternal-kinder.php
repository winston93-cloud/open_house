<?php
require('fpdf.php');
require('config.php');

// Configuración del PDF
class PDF extends FPDF {
    function Header() {
        $this->SetFont('Arial', 'B', 16);
        $this->Cell(0, 10, 'Educativo Winston', 0, 1, 'C');
        $this->SetFont('Arial', 'B', 14);
        $this->Cell(0, 10, utf8_decode('Reporte de Becas - Ciclo Escolar 2025-2026'), 0, 1, 'C');
        $this->Ln(5);
    }
    
    function Footer() {
        $this->SetY(-15);
        $this->SetFont('Arial', 'I', 8);
        $this->Cell(0, 10, utf8_decode('Página ') . $this->PageNo(), 0, 0, 'C');
    }
}

$pdf = new PDF();
$pdf->AddPage();
$pdf->SetFont('Arial', '', 12);

// Arrays para acumular totales generales por porcentaje
$totales_generales = array();

// ========================================================
// BECAS WINSTON
// ========================================================
$pdf->SetFillColor(255, 215, 0);
$pdf->SetFont('Arial', 'B', 15);
$pdf->Cell(0, 10, 'BECAS WINSTON', 1, 1, 'C', true);
$pdf->Ln(3);

// ========== MATERNAL ==========
$pdf->SetFont('Arial', 'B', 13);
$pdf->SetFillColor(255, 240, 200);
$pdf->Cell(0, 9, 'MATERNAL', 1, 1, 'C', true);
$pdf->Ln(2);

// Consulta para Maternal (nivel 1)
$query_maternal = "
    SELECT 
        ab.beca_porcentaje,
        COUNT(DISTINCT a.alumno_id) as total_alumnos
    FROM alumno a
    INNER JOIN alumno_beca ab ON a.alumno_id = ab.alumno_id
    WHERE a.alumno_nivel = 1
        AND a.alumno_ciclo_escolar = 22
        AND a.alumno_status = 1
        AND ab.beca_ciclo_escolar = 22
        AND ab.beca_estatus = 1
    GROUP BY ab.beca_porcentaje
    ORDER BY ab.beca_porcentaje ASC
";

$result_maternal = mysql_query($query_maternal, $conn);
$total_maternal_winston = 0;

if ($result_maternal && mysql_num_rows($result_maternal) > 0) {
    $pdf->SetFont('Arial', 'B', 11);
    $pdf->SetFillColor(220, 220, 220);
    $pdf->Cell(95, 7, 'Porcentaje', 1, 0, 'C', true);
    $pdf->Cell(95, 7, 'Total', 1, 1, 'C', true);
    
    $pdf->SetFont('Arial', '', 10);
    while ($row = mysql_fetch_assoc($result_maternal)) {
        $pdf->Cell(95, 6, $row['beca_porcentaje'] . '%', 1, 0, 'C');
        $pdf->Cell(95, 6, $row['total_alumnos'], 1, 1, 'C');
        $total_maternal_winston += $row['total_alumnos'];
        
        // Acumular para totales generales
        if (!isset($totales_generales[$row['beca_porcentaje']])) {
            $totales_generales[$row['beca_porcentaje']] = 0;
        }
        $totales_generales[$row['beca_porcentaje']] += $row['total_alumnos'];
    }
    
    $pdf->SetFont('Arial', 'B', 11);
    $pdf->SetFillColor(255, 255, 220);
    $pdf->Cell(95, 7, 'TOTAL:', 1, 0, 'R', true);
    $pdf->Cell(95, 7, $total_maternal_winston, 1, 1, 'C', true);
} else {
    $pdf->SetFont('Arial', 'I', 10);
    $pdf->Cell(0, 7, 'Sin datos', 1, 1, 'C');
}

$pdf->Ln(5);

// ========== KINDER ==========
$pdf->SetFont('Arial', 'B', 13);
$pdf->SetFillColor(255, 240, 200);
$pdf->Cell(0, 9, 'KINDER', 1, 1, 'C', true);
$pdf->Ln(2);

$query_kinder = "
    SELECT 
        ab.beca_porcentaje,
        COUNT(DISTINCT a.alumno_id) as total_alumnos
    FROM alumno a
    INNER JOIN alumno_beca ab ON a.alumno_id = ab.alumno_id
    WHERE a.alumno_nivel = 2
        AND a.alumno_ciclo_escolar = 22
        AND a.alumno_status = 1
        AND ab.beca_ciclo_escolar = 22
        AND ab.beca_estatus = 1
    GROUP BY ab.beca_porcentaje
    ORDER BY ab.beca_porcentaje ASC
";

$result_kinder = mysql_query($query_kinder, $conn);
$total_kinder_winston = 0;

if ($result_kinder && mysql_num_rows($result_kinder) > 0) {
    $pdf->SetFont('Arial', 'B', 11);
    $pdf->SetFillColor(220, 220, 220);
    $pdf->Cell(95, 7, 'Porcentaje', 1, 0, 'C', true);
    $pdf->Cell(95, 7, 'Total', 1, 1, 'C', true);
    
    $pdf->SetFont('Arial', '', 10);
    while ($row = mysql_fetch_assoc($result_kinder)) {
        $pdf->Cell(95, 6, $row['beca_porcentaje'] . '%', 1, 0, 'C');
        $pdf->Cell(95, 6, $row['total_alumnos'], 1, 1, 'C');
        $total_kinder_winston += $row['total_alumnos'];
        
        // Acumular para totales generales
        if (!isset($totales_generales[$row['beca_porcentaje']])) {
            $totales_generales[$row['beca_porcentaje']] = 0;
        }
        $totales_generales[$row['beca_porcentaje']] += $row['total_alumnos'];
    }
    
    $pdf->SetFont('Arial', 'B', 11);
    $pdf->SetFillColor(255, 255, 220);
    $pdf->Cell(95, 7, 'TOTAL:', 1, 0, 'R', true);
    $pdf->Cell(95, 7, $total_kinder_winston, 1, 1, 'C', true);
} else {
    $pdf->SetFont('Arial', 'I', 10);
    $pdf->Cell(0, 7, 'Sin datos', 1, 1, 'C');
}

$pdf->Ln(10);

// ========================================================
// BECAS AVANZA (SEP)
// ========================================================
$pdf->SetFillColor(144, 238, 144);
$pdf->SetFont('Arial', 'B', 15);
$pdf->Cell(0, 10, 'BECAS AVANZA (SEP)', 1, 1, 'C', true);
$pdf->Ln(3);

// Datos estaticos de AVANZA para Maternal y Kinder
$avanza_maternal_kinder = array(
    20 => 5,
    25 => 2,
    45 => 3
);

$pdf->SetFont('Arial', 'B', 13);
$pdf->SetFillColor(200, 255, 200);
$pdf->Cell(0, 9, 'MATERNAL Y KINDER', 1, 1, 'C', true);
$pdf->Ln(2);

$pdf->SetFont('Arial', 'B', 11);
$pdf->SetFillColor(220, 220, 220);
$pdf->Cell(95, 7, 'Porcentaje', 1, 0, 'C', true);
$pdf->Cell(95, 7, 'Total', 1, 1, 'C', true);

$pdf->SetFont('Arial', '', 10);
$total_avanza = 0;
foreach ($avanza_maternal_kinder as $porcentaje => $cantidad) {
    $pdf->Cell(95, 6, $porcentaje . '%', 1, 0, 'C');
    $pdf->Cell(95, 6, $cantidad, 1, 1, 'C');
    $total_avanza += $cantidad;
    
    // Acumular para totales generales
    if (!isset($totales_generales[$porcentaje])) {
        $totales_generales[$porcentaje] = 0;
    }
    $totales_generales[$porcentaje] += $cantidad;
}

$pdf->SetFont('Arial', 'B', 11);
$pdf->SetFillColor(200, 255, 200);
$pdf->Cell(95, 7, 'TOTAL:', 1, 0, 'R', true);
$pdf->Cell(95, 7, $total_avanza, 1, 1, 'C', true);

$pdf->Ln(10);

// ========================================================
// TOTALES GENERALES (WINSTON + AVANZA)
// ========================================================
$pdf->SetFillColor(255, 150, 150);
$pdf->SetFont('Arial', 'B', 15);
$pdf->Cell(0, 10, 'TOTALES GENERALES', 1, 1, 'C', true);
$pdf->Ln(3);

$pdf->SetFont('Arial', 'B', 11);
$pdf->SetFillColor(220, 220, 220);
$pdf->Cell(95, 7, 'Porcentaje de Beca', 1, 0, 'C', true);
$pdf->Cell(95, 7, 'Total de Alumnos', 1, 1, 'C', true);

$pdf->SetFont('Arial', '', 10);
ksort($totales_generales);
$gran_total = 0;

foreach ($totales_generales as $porcentaje => $total) {
    $pdf->Cell(95, 6, $porcentaje . '%', 1, 0, 'C');
    $pdf->Cell(95, 6, $total, 1, 1, 'C');
    $gran_total += $total;
}

$pdf->SetFont('Arial', 'B', 12);
$pdf->SetFillColor(255, 200, 200);
$pdf->Cell(95, 8, 'TOTAL GENERAL:', 1, 0, 'R', true);
$pdf->Cell(95, 8, $gran_total . ' alumnos', 1, 1, 'C', true);

mysql_close($conn);

// Generar PDF
$pdf->Output('I', 'Reporte_Becas_Maternal_Kinder.pdf');
?>

