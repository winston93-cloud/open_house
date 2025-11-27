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
// Optimizada con NOT EXISTS en lugar de LEFT JOIN para mayor velocidad
$query = "
SELECT 
    CASE 
        WHEN a.alumno_nivel IN (1,2) THEN 'Educativo'
        WHEN a.alumno_nivel IN (3,4) THEN 'Winston Churchill'
    END AS plantel,
    
    COUNT(*) AS total_alumnos,
    
    SUM(CASE WHEN a.mes = 1 THEN 1 ELSE 0 END) AS alumnos_plan_10,
    
    SUM(CASE WHEN a.mes = 2 THEN 1 ELSE 0 END) AS alumnos_plan_11,
    
    SUM(CASE WHEN (b.alumno_id IS NOT NULL OR sep.id IS NOT NULL) THEN 1 ELSE 0 END) AS alumnos_con_beca,
    
    SUM(CASE WHEN b.alumno_id IS NOT NULL THEN 1 ELSE 0 END) AS alumnos_beca_winston,
    
    SUM(CASE WHEN sep.id IS NOT NULL THEN 1 ELSE 0 END) AS alumnos_beca_sep,
    
    SUM(
        CASE 
            -- Si el concepto es de noviembre (03) a julio (26) Y tiene beca SEP, usar monto prorrateado directamente
            WHEN ('$concepto' >= '03' AND '$concepto' <= '26')
                 AND sep.id IS NOT NULL 
                 AND sep.estatus = 1 
                 AND sep.ciclo_escolar = 22
            THEN sep.monto_prorrateado
            
            -- Si no tiene beca SEP, usar cálculo normal con beca Winston (porcentaje)
            ELSE (
                CASE 
           WHEN a.alumno_nivel = 1 AND a.mes = 1 THEN 3550
           WHEN a.alumno_nivel = 1 AND a.mes = 2 THEN 3225
           WHEN a.alumno_nivel = 2 AND a.mes = 1 THEN 3150
           WHEN a.alumno_nivel = 2 AND a.mes = 2 THEN 2860
           WHEN a.alumno_nivel = 3 AND a.mes = 1 THEN 4880
           WHEN a.alumno_nivel = 3 AND a.mes = 2 THEN 4400
           WHEN a.alumno_nivel = 4 AND a.mes = 1 THEN 5260
           WHEN a.alumno_nivel = 4 AND a.mes = 2 THEN 4780
                END
            ) * (1 - IFNULL(b.beca_porcentaje,0)/100)
        END
    ) AS total_neto

FROM alumno a
LEFT JOIN alumno_beca b 
       ON a.alumno_id = b.alumno_id
      AND b.beca_ciclo_escolar = 22
      AND b.beca_estatus = 1
LEFT JOIN alumno_beca_sep sep
       ON a.alumno_ref = sep.alumno_ref
      AND sep.ciclo_escolar = 22
      AND sep.estatus = 1

WHERE a.alumno_ciclo_escolar = 22
  AND a.alumno_status = 1
  AND a.alumno_id NOT IN (
      SELECT alumno_id 
      FROM alumno_beca 
      WHERE beca_porcentaje = 100 
      AND beca_estatus = 1 
      AND beca_ciclo_escolar = 22
  )
  AND a.alumno_id IN (
      SELECT alumno_id 
      FROM pago_detalle
      WHERE SUBSTR(pago_referencia, 6, 4) IN ('1222', '1322')
  )
  AND NOT EXISTS (
      SELECT 1 FROM pago_detalle p
      WHERE p.alumno_id = a.alumno_id
      AND SUBSTR(p.pago_referencia, 6, 2) = '$concepto'
      AND SUBSTR(p.pago_referencia, 8, 2) = '22'
      LIMIT 1
  )

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

// Procesar cada plantel
while ($row = mysql_fetch_assoc($result)) {
    $plantel = $row['plantel'];
    $total_alumnos = $row['total_alumnos'];
    $alumnos_plan_10 = $row['alumnos_plan_10'];
    $alumnos_plan_11 = $row['alumnos_plan_11'];
    $alumnos_con_beca = $row['alumnos_con_beca'];
    $alumnos_beca_winston = $row['alumnos_beca_winston'];
    $alumnos_beca_sep = $row['alumnos_beca_sep'];
    $total_neto = $row['total_neto'];
    
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
    // Mostrar desglose de becas: Winston / SEP
    $texto_becas = number_format($alumnos_con_beca);
    if ($alumnos_beca_winston > 0 || $alumnos_beca_sep > 0) {
        $texto_becas .= ' (' . number_format($alumnos_beca_winston) . ' Winston';
        if ($alumnos_beca_sep > 0) {
            $texto_becas .= ' / ' . number_format($alumnos_beca_sep) . ' Sep';
        }
        $texto_becas .= ')';
    }
    $pdf->Cell(95, 7, $texto_becas, 1, 1, 'C');
    
    // Adeudo total
    $pdf->SetFillColor(255, 235, 235);
    $pdf->SetFont('Arial', 'B', 11);
    $pdf->Cell(95, 8, 'TOTAL ADEUDO NETO', 1, 0, 'L', true);
    $pdf->Cell(95, 8, '$' . number_format($total_neto, 2), 1, 1, 'C');
    
    $pdf->Ln(8);
}

// Nota informativa
$pdf->SetFont('Arial', 'I', 9);
$pdf->SetTextColor(100, 100, 100);
$pdf->MultiCell(0, 5, utf8_decode('NOTA: Este reporte muestra únicamente los alumnos activos que NO han realizado el pago del concepto seleccionado. El total neto incluye los descuentos por becas aplicados.'), 0, 'L');

mysql_close($conn);

// Salida del PDF
$pdf->Output('I', 'Reporte_Adeudos_Concepto_' . $concepto . '.pdf');

