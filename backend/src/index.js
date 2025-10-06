const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();
const transporter = require('./emailConfig');
const createEmailTemplate = require('./emailTemplate');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Backend funcionando correctamente' });
});

// Ruta para manejar el formulario de inscripción
app.post('/api/inscripcion', async (req, res) => {
  try {
    const {
      nombreAspirante,
      nivelAcademico,
      gradoEscolar,
      fechaNacimiento,
      genero,
      escuelaProcedencia,
      nombreCompleto,
      correo,
      whatsapp,
      parentesco,
      personasAsistiran,
      medioEntero
    } = req.body;

    // Validaciones básicas
    if (!nombreAspirante || !gradoEscolar || !fechaNacimiento || 
        !genero || !escuelaProcedencia || !nombreCompleto || !correo || 
        !whatsapp || !parentesco || !personasAsistiran || !medioEntero) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos obligatorios deben ser completados'
      });
    }

    // Validación de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      return res.status(400).json({
        success: false,
        message: 'El formato del correo electrónico no es válido'
      });
    }

    // Aquí normalmente guardarías en la base de datos
    console.log('Nueva inscripción recibida:', {
      nombreAspirante,
      nivelAcademico,
      gradoEscolar,
      fechaNacimiento,
      genero,
      escuelaProcedencia,
      nombreCompleto,
      correo,
      whatsapp,
      parentesco,
      personasAsistiran,
      medioEntero,
      timestamp: new Date().toISOString()
    });

    // Enviar email de confirmación
    try {
      const emailHtml = createEmailTemplate({
        nombreAspirante,
        nivelAcademico,
        gradoEscolar,
        fechaNacimiento,
        nombreCompleto,
        correo
      });

            const mailOptions = {
              from: `"${nivelAcademico === 'maternal' || nivelAcademico === 'kinder' ? 'Instituto Educativo Winston' : 'Instituto Winston Churchill'}" <sistemas.desarrollo@winston93.edu.mx>`,
              to: correo,
              subject: '🎉 Confirmación de Inscripción - Open House Winston Churchill 2025',
              html: emailHtml
            };

      // Obtener transporter (puede ser Winston o Gmail)
      const currentTransporter = await transporter;
      await currentTransporter.sendMail(mailOptions);
      console.log('✅ Email de confirmación enviado exitosamente a:', correo);
    } catch (emailError) {
      console.error('❌ Error al enviar email:', emailError);
      console.error('Detalles del error:', {
        code: emailError.code,
        response: emailError.response,
        command: emailError.command
      });
      // No fallar la inscripción si el email falla
    }

    res.json({
      success: true,
      message: 'Inscripción registrada exitosamente. Se ha enviado un email de confirmación.',
      data: {
        nombreAspirante,
        nivelAcademico,
        gradoEscolar
      }
    });

  } catch (error) {
    console.error('Error al procesar inscripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend ejecutándose en puerto ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});
