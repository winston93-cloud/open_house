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
                <h2 class="becas-title">Becas Winston</h2>
                <span class="becas-icon">🎓</span>
            </div>

            <div class="cards-grid">
                <!-- Tarjeta Maternal y Kinder -->
                <a href="maternal-kinder.php" class="admin-card maternal-card">
                    <div class="card-icon">🧸</div>
                    <h2 class="card-title">Maternal y Kinder</h2>
                    <p class="card-description">
                        Gestión de alumnos de nivel inicial
                    </p>
                    <div class="card-footer">
                        <span class="card-action">Ver documentos →</span>
                    </div>
                </a>

                <!-- Tarjeta Primaria -->
                <a href="primaria.php" class="admin-card primaria-card">
                    <div class="card-icon">📚</div>
                    <h2 class="card-title">Primaria</h2>
                    <p class="card-description">
                        Gestión de alumnos de nivel primaria
                    </p>
                    <div class="card-footer">
                        <span class="card-action">Ver documentos →</span>
                    </div>
                </a>

                <!-- Tarjeta Secundaria -->
                <a href="secundaria.php" class="admin-card secundaria-card">
                    <div class="card-icon">🎓</div>
                    <h2 class="card-title">Secundaria</h2>
                    <p class="card-description">
                        Gestión de alumnos de nivel secundaria
                    </p>
                    <div class="card-footer">
                        <span class="card-action">Ver documentos →</span>
                    </div>
                </a>
            </div>

            <footer class="gestion-footer">
                <p>Colegio Educativo Winston Churchill</p>
            </footer>
        </div>
    </div>
</body>
</html>

