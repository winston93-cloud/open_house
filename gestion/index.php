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

            <!-- SECCIÓN 2: Reportes Detallados -->
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

