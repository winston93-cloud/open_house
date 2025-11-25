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
        $this->SetTextColor(255, 193, 7);
        $this->Cell(0, 8, utf8_decode('Proyección de Ingresos'), 0, 1, 'C');
        
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

// Query adaptada para el concepto seleccionado
$query = "
SELECT 
    CASE 
        WHEN a.alumno_nivel IN (1,2) THEN 'Educativo'
        WHEN a.alumno_nivel IN (3,4) THEN 'Winston Churchill'
    END AS plantel,
    
    COUNT(DISTINCT a.alumno_id) AS total_alumnos,
    
    COUNT(DISTINCT CASE WHEN b.alumno_id IS NOT NULL THEN a.alumno_id END) AS alumnos_becados,
    
    COUNT(DISTINCT CASE WHEN a.mes = 1 THEN a.alumno_id END) AS plan_10_meses,
    
    COUNT(DISTINCT CASE WHEN a.mes = 2 THEN a.alumno_id END) AS plan_12_meses,
    
    SUM(
       (CASE 
           WHEN a.alumno_nivel = 1 AND a.mes = 1 THEN 3550
           WHEN a.alumno_nivel = 1 AND a.mes = 2 THEN 3225
           WHEN a.alumno_nivel = 2 AND a.mes = 1 THEN 3150
           WHEN a.alumno_nivel = 2 AND a.mes = 2 THEN 2860
           WHEN a.alumno_nivel = 3 AND a.mes = 1 THEN 4880
           WHEN a.alumno_nivel = 3 AND a.mes = 2 THEN 4400
           WHEN a.alumno_nivel = 4 AND a.mes = 1 THEN 5200
           WHEN a.alumno_nivel = 4 AND a.mes = 2 THEN 4780
        END)
        * (CASE WHEN EXISTS (
             SELECT 1 FROM pago_detalle pd
             WHERE pd.pago_referencia LIKE CONCAT(a.alumno_ref, '%$concepto%22%')
             AND pd.alumno_id = a.alumno_id
           ) THEN 1 ELSE 0 END)
    ) AS ingreso_bruto,
    
    SUM(
       (CASE 
           WHEN a.alumno_nivel = 1 AND a.mes = 1 THEN 3550
           WHEN a.alumno_nivel = 1 AND a.mes = 2 THEN 3225
           WHEN a.alumno_nivel = 2 AND a.mes = 1 THEN 3150
           WHEN a.alumno_nivel = 2 AND a.mes = 2 THEN 2860
           WHEN a.alumno_nivel = 3 AND a.mes = 1 THEN 4880
           WHEN a.alumno_nivel = 3 AND a.mes = 2 THEN 4400
           WHEN a.alumno_nivel = 4 AND a.mes = 1 THEN 5200
           WHEN a.alumno_nivel = 4 AND a.mes = 2 THEN 4780
        END)
        * (1 - IFNULL(b.beca_porcentaje,0)/100)
        * (CASE WHEN EXISTS (
             SELECT 1 FROM pago_detalle pd
             WHERE pd.pago_referencia LIKE CONCAT(a.alumno_ref, '%$concepto%22%')
             AND pd.alumno_id = a.alumno_id
           ) THEN 1 ELSE 0 END)
    ) AS ingreso_neto

FROM alumno a
LEFT JOIN alumno_beca b 
       ON a.alumno_id = b.alumno_id
      AND b.beca_ciclo_escolar = 22
      AND b.beca_estatus = 1

WHERE a.alumno_ciclo_escolar = 22
  AND a.alumno_status = 1

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

// Inicializar totales
$total_general_alumnos = 0;
$total_general_becados = 0;
$total_general_plan10 = 0;
$total_general_plan12 = 0;
$total_general_bruto = 0;
$total_general_neto = 0;

// Procesar cada plantel
while ($row = mysql_fetch_assoc($result)) {
    $plantel = $row['plantel'];
    $total_alumnos = $row['total_alumnos'];
    $alumnos_becados = $row['alumnos_becados'];
    $plan_10_meses = $row['plan_10_meses'];
    $plan_12_meses = $row['plan_12_meses'];
    $ingreso_bruto = $row['ingreso_bruto'];
    $ingreso_neto = $row['ingreso_neto'];
    
    // Acumular totales
    $total_general_alumnos += $total_alumnos;
    $total_general_becados += $alumnos_becados;
    $total_general_plan10 += $plan_10_meses;
    $total_general_plan12 += $plan_12_meses;
    $total_general_bruto += $ingreso_bruto;
    $total_general_neto += $ingreso_neto;
    
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
    
    // Fila 1: Total alumnos y becados
    $pdf->Cell(95, 7, 'Total Alumnos', 1, 0, 'L', true);
    $pdf->Cell(95, 7, number_format($total_alumnos), 1, 1, 'C');
    
    $pdf->Cell(95, 7, 'Alumnos Becados', 1, 0, 'L', true);
    $pdf->Cell(95, 7, number_format($alumnos_becados), 1, 1, 'C');
    
    $pdf->Cell(95, 7, 'Plan 10 Meses', 1, 0, 'L', true);
    $pdf->Cell(95, 7, number_format($plan_10_meses), 1, 1, 'C');
    
    $pdf->Cell(95, 7, 'Plan 12 Meses', 1, 0, 'L', true);
    $pdf->Cell(95, 7, number_format($plan_12_meses), 1, 1, 'C');
    
    // Ingresos
    $pdf->SetFillColor(200, 255, 200);
    $pdf->Cell(95, 7, 'Ingreso Bruto', 1, 0, 'L', true);
    $pdf->Cell(95, 7, '$' . number_format($ingreso_bruto, 2), 1, 1, 'C');
    
    $pdf->SetFillColor(255, 255, 200);
    $pdf->Cell(95, 7, 'Ingreso Neto (con becas)', 1, 0, 'L', true);
    $pdf->Cell(95, 7, '$' . number_format($ingreso_neto, 2), 1, 1, 'C');
    
    $diferencia = $ingreso_bruto - $ingreso_neto;
    $pdf->SetFillColor(255, 200, 200);
    $pdf->Cell(95, 7, 'Diferencia por Becas', 1, 0, 'L', true);
    $pdf->Cell(95, 7, '$' . number_format($diferencia, 2), 1, 1, 'C');
    
    $pdf->Ln(8);
}

// TOTALES GENERALES
$pdf->SetFillColor(100, 100, 100);
$pdf->SetTextColor(255, 255, 255);
$pdf->SetFont('Arial', 'B', 14);
$pdf->Cell(0, 10, 'TOTALES GENERALES', 1, 1, 'C', true);
$pdf->SetTextColor(0, 0, 0);
$pdf->Ln(2);

$pdf->SetFont('Arial', 'B', 11);
$pdf->SetFillColor(220, 220, 220);

$pdf->Cell(95, 8, 'Total Alumnos', 1, 0, 'L', true);
$pdf->Cell(95, 8, number_format($total_general_alumnos), 1, 1, 'C');

$pdf->Cell(95, 8, 'Total Becados', 1, 0, 'L', true);
$pdf->Cell(95, 8, number_format($total_general_becados), 1, 1, 'C');

$pdf->Cell(95, 8, 'Total Plan 10 Meses', 1, 0, 'L', true);
$pdf->Cell(95, 8, number_format($total_general_plan10), 1, 1, 'C');

$pdf->Cell(95, 8, 'Total Plan 12 Meses', 1, 0, 'L', true);
$pdf->Cell(95, 8, number_format($total_general_plan12), 1, 1, 'C');

$pdf->SetFillColor(200, 255, 200);
$pdf->Cell(95, 8, 'Ingreso Bruto Total', 1, 0, 'L', true);
$pdf->Cell(95, 8, '$' . number_format($total_general_bruto, 2), 1, 1, 'C');

$pdf->SetFillColor(255, 255, 200);
$pdf->Cell(95, 8, 'Ingreso Neto Total', 1, 0, 'L', true);
$pdf->Cell(95, 8, '$' . number_format($total_general_neto, 2), 1, 1, 'C');

$diferencia_total = $total_general_bruto - $total_general_neto;
$pdf->SetFillColor(255, 200, 200);
$pdf->Cell(95, 8, 'Diferencia Total por Becas', 1, 0, 'L', true);
$pdf->Cell(95, 8, '$' . number_format($diferencia_total, 2), 1, 1, 'C');

$porcentaje_becas = $total_general_alumnos > 0 ? ($total_general_becados / $total_general_alumnos * 100) : 0;
$pdf->SetFillColor(200, 200, 255);
$pdf->Cell(95, 8, 'Porcentaje de Becados', 1, 0, 'L', true);
$pdf->Cell(95, 8, number_format($porcentaje_becas, 1) . '%', 1, 1, 'C');

mysql_close($conn);

// Salida del PDF
$pdf->Output('I', 'Reporte_Ingresos_Concepto_' . $concepto . '.pdf');

