<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gestión Administrativa - Winston Churchill</title>
    <link rel="stylesheet" href="styles.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
</head>
<body>
    <div class="gestion-container">
        <div class="gestion-content">
            <header class="gestion-header">
                <h1 class="gestion-title">
                    Gestión Administrativa
                </h1>
                <div class="title-underline"></div>
            </header>

            <div class="becas-banner">
                <span class="becas-icon">🎓</span>
                <h2 class="becas-title">Becas Winston / Becas SEP</h2>
                <span class="becas-icon">🎓</span>
            </div>

            <!-- SECCIÓN 1: Reportes Resumen -->
            <div class="seccion-reportes">
                <h3 class="seccion-titulo">📊 Reportes Resumen por Porcentaje</h3>
                <div class="cards-grid">
                    <!-- Tarjeta Maternal y Kinder -->
                    <a href="reporte-maternal-kinder.php" target="_blank" class="admin-card maternal-card">
                        <div class="card-icon">🧸</div>
                        <h2 class="card-title">Maternal y Kinder</h2>
                        <p class="card-description">
                            Reporte de becas por porcentaje
                        </p>
                        <div class="card-footer">
                            <span class="card-action">Generar PDF →</span>
                        </div>
                    </a>

                    <!-- Tarjeta Primaria -->
                    <a href="reporte-primaria.php" target="_blank" class="admin-card primaria-card">
                        <div class="card-icon">📚</div>
                        <h2 class="card-title">Primaria</h2>
                        <p class="card-description">
                            Reporte de becas por porcentaje
                        </p>
                        <div class="card-footer">
                            <span class="card-action">Generar PDF →</span>
                        </div>
                    </a>

                    <!-- Tarjeta Secundaria -->
                    <a href="reporte-secundaria.php" target="_blank" class="admin-card secundaria-card">
                        <div class="card-icon">🎓</div>
                        <h2 class="card-title">Secundaria</h2>
                        <p class="card-description">
                            Reporte de becas por porcentaje
                        </p>
                        <div class="card-footer">
                            <span class="card-action">Generar PDF →</span>
                        </div>
                    </a>
                </div>
            </div>

            <!-- SECCIÓN 2: Reportes de Ingresos / Adeudos -->
            <div class="seccion-reportes seccion-ingresos">
                <h3 class="seccion-titulo">💰 Proyección de Ingresos por Concepto / Adeudos</h3>
                
                <!-- Subsección: Ingresos -->
                <div class="subseccion-header">
                    <h4 class="subseccion-titulo">✅ Ingresos Cobrados</h4>
                </div>
                <div class="ingresos-form">
                    <form action="reporte-ingresos.php" method="POST" target="_blank" class="form-concepto">
                        <label for="concepto" class="form-label">Selecciona el concepto de pago:</label>
                        <select name="concepto" id="concepto" class="form-select" required>
                            <option value="">-- Selecciona un concepto --</option>
                            <option value="00">00 - Cuota de inicio de ciclo y seguro</option>
                            <option value="01">01 - Colegiatura de Septiembre</option>
                            <option value="02">02 - Colegiatura de Octubre</option>
                            <option value="03">03 - Colegiatura de Noviembre</option>
                            <option value="04">04 - Colegiatura de Diciembre</option>
                            <option value="05">05 - Colegiatura de Enero</option>
                            <option value="06">06 - Colegiatura de Febrero</option>
                            <option value="07">07 - Colegiatura de Marzo</option>
                            <option value="08">08 - Colegiatura de Abril</option>
                            <option value="09">09 - Colegiatura de Mayo</option>
                            <option value="10">10 - Colegiatura de Junio</option>
                            <option value="26">26 - Colegiatura de Julio</option>
                        </select>
                        <button type="submit" class="btn-generar btn-ingresos">
                            <span class="btn-icon">📊</span>
                            Ver Ingresos Cobrados
                        </button>
                    </form>
                </div>

                <!-- Subsección: Adeudos -->
                <div class="subseccion-header">
                    <h4 class="subseccion-titulo">❌ Adeudos Pendientes</h4>
                </div>
                <div class="ingresos-form">
                    <form action="reporte-adeudos.php" method="POST" target="_blank" class="form-concepto">
                        <label for="concepto_adeudo" class="form-label">Selecciona el concepto a revisar:</label>
                        <select name="concepto" id="concepto_adeudo" class="form-select" required>
                            <option value="">-- Selecciona un concepto --</option>
                            <option value="00">00 - Cuota de inicio de ciclo y seguro</option>
                            <option value="01">01 - Colegiatura de Septiembre</option>
                            <option value="02">02 - Colegiatura de Octubre</option>
                            <option value="03">03 - Colegiatura de Noviembre</option>
                            <option value="04">04 - Colegiatura de Diciembre</option>
                            <option value="05">05 - Colegiatura de Enero</option>
                            <option value="06">06 - Colegiatura de Febrero</option>
                            <option value="07">07 - Colegiatura de Marzo</option>
                            <option value="08">08 - Colegiatura de Abril</option>
                            <option value="09">09 - Colegiatura de Mayo</option>
                            <option value="10">10 - Colegiatura de Junio</option>
                            <option value="26">26 - Colegiatura de Julio</option>
                        </select>
                        <button type="submit" class="btn-generar btn-adeudos">
                            <span class="btn-icon">💸</span>
                            Ver Adeudos Pendientes
                        </button>
                    </form>
                </div>
            </div>

            <!-- SECCIÓN 3: Reportes Detallados -->
            <div class="seccion-reportes seccion-detalle">
                <h3 class="seccion-titulo">📋 Reportes Detallados con Nombres</h3>
                <div class="cards-grid">
                    <!-- Tarjeta Maternal y Kinder Detallado -->
                    <a href="reporte-maternal-kinder-detalle.php" target="_blank" class="admin-card maternal-card">
                        <div class="card-icon">🧸</div>
                        <h2 class="card-title">Maternal y Kinder</h2>
                        <p class="card-description">
                            Con nombres y grados de alumnos
                        </p>
                        <div class="card-footer">
                            <span class="card-action">Generar PDF →</span>
                        </div>
                    </a>

                    <!-- Tarjeta Primaria Detallado -->
                    <a href="reporte-primaria-detalle.php" target="_blank" class="admin-card primaria-card">
                        <div class="card-icon">📚</div>
                        <h2 class="card-title">Primaria</h2>
                        <p class="card-description">
                            Con nombres y grados de alumnos
                        </p>
                        <div class="card-footer">
                            <span class="card-action">Generar PDF →</span>
                        </div>
                    </a>

                    <!-- Tarjeta Secundaria Detallado -->
                    <a href="reporte-secundaria-detalle.php" target="_blank" class="admin-card secundaria-card">
                        <div class="card-icon">🎓</div>
                        <h2 class="card-title">Secundaria</h2>
                        <p class="card-description">
                            Con nombres y grados de alumnos
                        </p>
                        <div class="card-footer">
                            <span class="card-action">Generar PDF →</span>
                        </div>
                    </a>
                </div>
            </div>

            <footer class="gestion-footer">
                <p>Colegio Educativo Winston Churchill</p>
            </footer>
        </div>
    </div>
</body>
</html>

