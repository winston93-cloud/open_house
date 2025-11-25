<?php
require('fpdf.php');
require('config.php');

class PDF extends FPDF {
    function Header() {
        $this->SetFont('Arial', 'B', 16);
        $this->Cell(0, 10, 'Instituto Winston Churchill', 0, 1, 'C');
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

function obtenerNombreGradoPrimaria($grado) {
    $grados = array(1 => '1ro', 2 => '2do', 3 => '3ro', 4 => '4to', 5 => '5to', 6 => '6to');
    return isset($grados[$grado]) ? $grados[$grado] : $grado . 'to';
}

$pdf = new PDF();
$pdf->AddPage();
$pdf->SetFont('Arial', '', 12);

// ========== PRIMARIA ==========
$pdf->SetFillColor(255, 215, 0);
$pdf->SetFont('Arial', 'B', 14);
$pdf->Cell(0, 10, 'PRIMARIA', 1, 1, 'C', true);
$pdf->Ln(3);

$query_porcentajes = "
    SELECT DISTINCT ab.beca_porcentaje
    FROM alumno a
    INNER JOIN alumno_beca ab ON a.alumno_id = ab.alumno_id
    WHERE a.alumno_nivel = 3
        AND a.alumno_ciclo_escolar = 22
        AND a.alumno_status = 1
        AND ab.beca_ciclo_escolar = 22
        AND ab.beca_estatus = 1
    ORDER BY ab.beca_porcentaje ASC
";

$result_porcentajes = mysql_query($query_porcentajes, $conn);
$total_primaria = 0;

if ($result_porcentajes && mysql_num_rows($result_porcentajes) > 0) {
    while ($row_porc = mysql_fetch_assoc($result_porcentajes)) {
        $porcentaje = $row_porc['beca_porcentaje'];
        
        $query_alumnos = "
            SELECT 
                CONCAT(a.alumno_nombre, ' ', a.alumno_app, ' ', a.alumno_apm) as nombre_completo,
                a.alumno_grado
            FROM alumno a
            INNER JOIN alumno_beca ab ON a.alumno_id = ab.alumno_id
            WHERE a.alumno_nivel = 3
                AND a.alumno_ciclo_escolar = 22
                AND a.alumno_status = 1
                AND ab.beca_ciclo_escolar = 22
                AND ab.beca_estatus = 1
                AND ab.beca_porcentaje = $porcentaje
            ORDER BY a.alumno_grado ASC, a.alumno_nombre ASC
        ";
        
        $result_alumnos = mysql_query($query_alumnos, $conn);
        $count = mysql_num_rows($result_alumnos);
        $total_primaria += $count;
        
        $pdf->SetFont('Arial', 'B', 12);
        $pdf->SetFillColor(200, 220, 255);
        $pdf->Cell(0, 8, 'Beca: ' . $porcentaje . '% - Total: ' . $count . ' alumnos', 1, 1, 'L', true);
        
        $pdf->SetFont('Arial', '', 10);
        while ($alumno = mysql_fetch_assoc($result_alumnos)) {
            $grado_texto = obtenerNombreGradoPrimaria($alumno['alumno_grado']);
            $pdf->Cell(10, 6, '', 0, 0);
            $pdf->Cell(0, 6, utf8_decode('- ' . $alumno['nombre_completo'] . ' - ' . $grado_texto), 0, 1);
        }
        
        $pdf->Ln(3);
    }
    
    $pdf->SetFont('Arial', 'B', 12);
    $pdf->SetFillColor(255, 255, 200);
    $pdf->Cell(0, 8, 'TOTAL PRIMARIA: ' . $total_primaria . ' alumnos', 1, 1, 'C', true);
} else {
    $pdf->SetFont('Arial', 'I', 11);
    $pdf->Cell(0, 8, 'No hay alumnos con beca en Primaria', 1, 1, 'C');
}

mysql_close($conn);
$pdf->Output('I', 'Reporte_Detallado_Primaria.pdf');
?>

