<?php
require('fpdf.php');
require('config.php');

// Verificar que se recibio el concepto
if (!isset($_POST['concepto']) || $_POST['concepto'] === '') {
    die('Error: No se selecciono un concepto');
}

$concepto = str_pad($_POST['concepto'], 2, '0', STR_PAD_LEFT);

// Nombres de conceptos
$nombres_conceptos = array(
    '00' => 'Cuota de inicio de ciclo y seguro',
    '01' => 'Colegiatura de Septiembre',
    '02' => 'Colegiatura de Octubre',
    '03' => 'Colegiatura de Noviembre',
    '04' => 'Colegiatura de Diciembre',
    '05' => 'Colegiatura de Enero',
    '06' => 'Colegiatura de Febrero',
    '07' => 'Colegiatura de Marzo',
    '08' => 'Colegiatura de Abril',
    '09' => 'Colegiatura de Mayo',
    '10' => 'Colegiatura de Junio',
    '26' => 'Colegiatura de Julio'
);

$nombre_concepto = isset($nombres_conceptos[$concepto]) ? $nombres_conceptos[$concepto] : 'Concepto desconocido';

// Configuracion del PDF
class PDF extends FPDF {
    private $concepto_nombre;
    
    function setConceptoNombre($nombre) {
        $this->concepto_nombre = $nombre;
    }
    
    function Header() {
        $this->SetFont('Arial', 'B', 18);
        $this->SetTextColor(0, 50, 80);
        $this->Cell(0, 10, 'INSTITUTOS WINSTON', 0, 1, 'C');
        
        $this->SetFont('Arial', 'B', 14);
        $this->SetTextColor(244, 67, 54);
        $this->Cell(0, 8, utf8_decode('Reporte de Adeudos Pendientes'), 0, 1, 'C');
        
        $this->SetFont('Arial', '', 11);
        $this->SetTextColor(60, 60, 60);
        $this->Cell(0, 6, 'Ciclo Escolar 2025-2026', 0, 1, 'C');
        $this->Cell(0, 6, utf8_decode('Concepto: ' . $this->concepto_nombre), 0, 1, 'C');
        
        $this->Ln(5);
    }
    
    function Footer() {
        $this->SetY(-15);
        $this->SetFont('Arial', 'I', 8);
        $this->SetTextColor(128, 128, 128);
        $this->Cell(0, 10, utf8_decode('Página ') . $this->PageNo(), 0, 0, 'C');
    }
}

// Query para adeudos (alumnos que NO han pagado el concepto)
$query = "
SELECT 
    CASE 
        WHEN a.alumno_nivel IN (1,2) THEN 'Educativo'
        WHEN a.alumno_nivel IN (3,4) THEN 'Winston Churchill'
    END AS plantel,
    
    COUNT(*) AS total_alumnos,
    
    SUM(CASE WHEN a.mes = 1 THEN 1 ELSE 0 END) AS alumnos_plan_10,
    
    SUM(CASE WHEN a.mes = 2 THEN 1 ELSE 0 END) AS alumnos_plan_11,
    
    SUM(CASE WHEN b.alumno_id IS NOT NULL THEN 1 ELSE 0 END) AS alumnos_con_beca,
    
    SUM(
       (CASE 
           WHEN a.alumno_nivel = 1 AND a.mes = 1 THEN 3550
           WHEN a.alumno_nivel = 1 AND a.mes = 2 THEN 3225
           WHEN a.alumno_nivel = 2 AND a.mes = 1 THEN 3150
           WHEN a.alumno_nivel = 2 AND a.mes = 2 THEN 2860
           WHEN a.alumno_nivel = 3 AND a.mes = 1 THEN 4880
           WHEN a.alumno_nivel = 3 AND a.mes = 2 THEN 4400
           WHEN a.alumno_nivel = 4 AND a.mes = 1 THEN 5260
           WHEN a.alumno_nivel = 4 AND a.mes = 2 THEN 4780
        END) * (1 - IFNULL(b.beca_porcentaje,0)/100)
    ) AS total_neto

FROM alumno a
LEFT JOIN alumno_beca b 
       ON a.alumno_id = b.alumno_id
      AND b.beca_ciclo_escolar = 22
      AND b.beca_estatus = 1
LEFT JOIN pago_detalle p 
       ON p.pago_referencia LIKE CONCAT(a.alumno_ref, '$concepto', '22%')

WHERE a.alumno_ciclo_escolar = 22
  AND a.alumno_status = 1
  AND p.pago_id IS NULL

GROUP BY plantel
";

$result = mysql_query($query, $conn);

if (!$result) {
    die('Error en la consulta: ' . mysql_error());
}

// Crear PDF
$pdf = new PDF();
$pdf->setConceptoNombre($nombre_concepto);
$pdf->SetMargins(15, 20, 15);
$pdf->AddPage();
$pdf->SetAutoPageBreak(true, 20);

// Verificar si hay adeudos
if (mysql_num_rows($result) == 0) {
    $pdf->SetFont('Arial', 'B', 14);
    $pdf->SetTextColor(76, 175, 80);
    $pdf->Cell(0, 15, '', 0, 1);
    $pdf->Cell(0, 10, utf8_decode('✓ ¡Excelente!'), 0, 1, 'C');
    $pdf->SetFont('Arial', '', 12);
    $pdf->MultiCell(0, 8, utf8_decode('No hay adeudos pendientes para este concepto. Todos los alumnos activos han realizado su pago.'), 0, 'C');
    $pdf->Output('I', 'Reporte_Adeudos_Concepto_' . $concepto . '.pdf');
    exit;
}

// Inicializar totales
$total_general_alumnos = 0;
$total_general_plan10 = 0;
$total_general_plan11 = 0;
$total_general_becados = 0;
$total_general_adeudo = 0;

// Procesar cada plantel
while ($row = mysql_fetch_assoc($result)) {
    $plantel = $row['plantel'];
    $total_alumnos = $row['total_alumnos'];
    $alumnos_plan_10 = $row['alumnos_plan_10'];
    $alumnos_plan_11 = $row['alumnos_plan_11'];
    $alumnos_con_beca = $row['alumnos_con_beca'];
    $total_neto = $row['total_neto'];
    
    // Acumular totales
    $total_general_alumnos += $total_alumnos;
    $total_general_plan10 += $alumnos_plan_10;
    $total_general_plan11 += $alumnos_plan_11;
    $total_general_becados += $alumnos_con_beca;
    $total_general_adeudo += $total_neto;
    
    // Color segun plantel
    if ($plantel == 'Educativo') {
        $pdf->SetFillColor(255, 215, 0);
    } else {
        $pdf->SetFillColor(100, 149, 237);
    }
    
    // Titulo del plantel
    $pdf->SetFont('Arial', 'B', 14);
    $pdf->Cell(0, 10, $plantel, 1, 1, 'C', true);
    $pdf->Ln(2);
    
    // Tabla de datos
    $pdf->SetFont('Arial', 'B', 10);
    $pdf->SetFillColor(220, 220, 220);
    
    // Alumnos con adeudo
    $pdf->SetFillColor(255, 200, 200);
    $pdf->Cell(95, 7, utf8_decode('Alumnos con Adeudo'), 1, 0, 'L', true);
    $pdf->Cell(95, 7, number_format($total_alumnos), 1, 1, 'C');
    
    $pdf->SetFillColor(220, 220, 220);
    $pdf->Cell(95, 7, 'Plan 10 Meses', 1, 0, 'L', true);
    $pdf->Cell(95, 7, number_format($alumnos_plan_10), 1, 1, 'C');
    
    $pdf->Cell(95, 7, 'Plan 11 Meses', 1, 0, 'L', true);
    $pdf->Cell(95, 7, number_format($alumnos_plan_11), 1, 1, 'C');
    
    $pdf->Cell(95, 7, 'Con Beca', 1, 0, 'L', true);
    $pdf->Cell(95, 7, number_format($alumnos_con_beca), 1, 1, 'C');
    
    // Adeudo total
    $pdf->SetFillColor(255, 235, 235);
    $pdf->SetFont('Arial', 'B', 11);
    $pdf->Cell(95, 8, 'TOTAL ADEUDO NETO', 1, 0, 'L', true);
    $pdf->Cell(95, 8, '$' . number_format($total_neto, 2), 1, 1, 'C');
    
    $pdf->Ln(8);
}

// TOTALES GENERALES
$pdf->SetFillColor(244, 67, 54);
$pdf->SetTextColor(255, 255, 255);
$pdf->SetFont('Arial', 'B', 14);
$pdf->Cell(0, 10, 'TOTALES GENERALES DE ADEUDOS', 1, 1, 'C', true);
$pdf->SetTextColor(0, 0, 0);
$pdf->Ln(2);

$pdf->SetFont('Arial', 'B', 11);
$pdf->SetFillColor(255, 200, 200);

$pdf->Cell(95, 8, utf8_decode('Total Alumnos con Adeudo'), 1, 0, 'L', true);
$pdf->Cell(95, 8, number_format($total_general_alumnos), 1, 1, 'C');

$pdf->SetFillColor(220, 220, 220);
$pdf->Cell(95, 8, 'Total Plan 10 Meses', 1, 0, 'L', true);
$pdf->Cell(95, 8, number_format($total_general_plan10), 1, 1, 'C');

$pdf->Cell(95, 8, 'Total Plan 11 Meses', 1, 0, 'L', true);
$pdf->Cell(95, 8, number_format($total_general_plan11), 1, 1, 'C');

$pdf->Cell(95, 8, 'Total con Becas', 1, 0, 'L', true);
$pdf->Cell(95, 8, number_format($total_general_becados), 1, 1, 'C');

// Total a recuperar
$pdf->SetFillColor(255, 235, 235);
$pdf->SetFont('Arial', 'B', 12);
$pdf->Cell(95, 10, utf8_decode('TOTAL A RECUPERAR (Neto)'), 1, 0, 'L', true);
$pdf->Cell(95, 10, '$' . number_format($total_general_adeudo, 2), 1, 1, 'C');

$porcentaje_becados = $total_general_alumnos > 0 ? ($total_general_becados / $total_general_alumnos * 100) : 0;
$pdf->SetFillColor(200, 200, 255);
$pdf->SetFont('Arial', 'B', 10);
$pdf->Cell(95, 8, '% con Beca', 1, 0, 'L', true);
$pdf->Cell(95, 8, number_format($porcentaje_becados, 1) . '%', 1, 1, 'C');

// Nota informativa
$pdf->Ln(5);
$pdf->SetFont('Arial', 'I', 9);
$pdf->SetTextColor(100, 100, 100);
$pdf->MultiCell(0, 5, utf8_decode('NOTA: Este reporte muestra únicamente los alumnos activos que NO han realizado el pago del concepto seleccionado. El total neto incluye los descuentos por becas aplicados.'), 0, 'L');

mysql_close($conn);

// Salida del PDF
$pdf->Output('I', 'Reporte_Adeudos_Concepto_' . $concepto . '.pdf');

