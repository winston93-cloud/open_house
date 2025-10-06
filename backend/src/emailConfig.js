const nodemailer = require('nodemailer');

// Configuración directa con Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'sistemas.desarrollo@winston93.edu.mx',
    pass: 'ckxc xdfg oxqx jtmm'
  }
});

// Verificar la configuración
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Error en configuración de email:', error);
  } else {
    console.log('✅ Configuración de email Gmail lista');
  }
});

module.exports = transporter;