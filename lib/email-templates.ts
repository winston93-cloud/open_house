// =============================================================================
// TEMPLATES DE EMAIL PARA SEGUIMIENTOS
// Estos templates se usan en los seguimientos automáticos de 24h, 72h y 5 días
// =============================================================================

export function getEmailTemplate24h(nombre: string, plantel: string = 'winston'): string {
  // Configuración dinámica según plantel
  const isWinston = plantel === 'winston';
  const institucion = isWinston ? 'INSTITUTO WINSTON CHURCHILL' : 'INSTITUTO EDUCATIVO WINSTON';
  const whatsappNumber = isWinston ? '528334378743' : '528333474507';
  const whatsappDisplay = isWinston ? '833 437 87 43' : '833 347 45 07';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Recordatorio Winston</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #d8d8d8;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #d8d8d8; padding: 50px 20px;">
        <tr>
          <td align="center">
            <!-- Tarjeta principal -->
            <table width="450" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 25px; box-shadow: 0 8px 30px rgba(0,0,0,0.12); max-width: 90%;">
              
              <!-- Logo Winston -->
              <tr>
                <td style="padding: 35px 35px 0 35px; text-align: right;">
                  <span style="font-family: Arial, sans-serif; font-size: 32px; font-weight: bold; color: #0088CC; letter-spacing: -1px;">Winston</span>
                </td>
              </tr>
              
              <!-- Contenido principal -->
              <tr>
                <td style="padding: 20px 35px 40px 35px;">
                  
                  <!-- HOLA TE RECORDAMOS -->
                  <h1 style="font-family: Arial, sans-serif; font-size: 34px; font-weight: bold; margin: 0 0 20px 0; line-height: 1.1;">
                    <span style="color: #00A8E1;">HOLA</span><br>
                    <span style="color: ${isWinston ? '#00A8E1' : '#E53935'};">TE RECORDAMOS</span>
                  </h1>
                  
                  <!-- Texto principal -->
                  <p style="font-family: Arial, sans-serif; color: #00A8E1; font-size: 15px; margin: 0 0 10px 0; line-height: 1.5;">
                    que estamos disponibles para apoyarte con el proceso de admisión al
                  </p>
                  
                  <p style="font-family: Arial, sans-serif; color: #0066CC; font-size: 17px; font-weight: bold; margin: 0 0 25px 0;">
                    ${institucion}
                  </p>
                  
                  <!-- Escríbenos al -->
                  <p style="font-family: Arial, sans-serif; color: #0066CC; font-size: 14px; font-weight: bold; margin: 0 0 8px 0;">
                    Escríbenos al
                  </p>
                  
                  <!-- Número WhatsApp -->
                  <p style="margin: 0 0 25px 0;">
                    <a href="https://wa.me/${whatsappNumber}" style="font-family: Arial, sans-serif; color: #0066CC; font-size: 24px; font-weight: bold; text-decoration: none;">
                      <span style="font-size: 20px;">💬</span> ${whatsappDisplay}
                    </a>
                  </p>
                  
                  <!-- CON GUSTO -->
                  <p style="font-family: Arial, sans-serif; color: #0066CC; font-size: 16px; font-weight: bold; margin: 0 0 5px 0;">
                    CON GUSTO
                  </p>
                  <p style="font-family: Arial, sans-serif; color: #00A8E1; font-size: 15px; margin: 0 0 30px 0; line-height: 1.5;">
                    te brindamos toda la información necesaria.
                  </p>
                  
                  <!-- Botón CONTÁCTANOS -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <a href="https://wa.me/${whatsappNumber}" style="display: inline-block; background-color: ${isWinston ? '#8BC34A' : '#E53935'}; color: #ffffff; text-decoration: none; padding: 14px 45px; border-radius: 30px; font-family: Arial, sans-serif; font-size: 15px; font-weight: bold;">
                          ➜ CONTÁCTANOS
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function getEmailTemplate72h(nombre: string, plantel: string = 'winston'): string {
  // Configuración dinámica según plantel
  const isWinston = plantel === 'winston';
  const institucion = isWinston ? 'INSTITUTO WINSTON CHURCHILL' : 'INSTITUTO EDUCATIVO WINSTON';
  const whatsappNumber = isWinston ? '528334378743' : '528333474507';
  const whatsappDisplay = isWinston ? '833 437 87 43' : '833 347 45 07';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Agenda tu recorrido - Winston</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #d8d8d8;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #d8d8d8; padding: 50px 20px;">
        <tr>
          <td align="center">
            <!-- Tarjeta principal -->
            <table width="450" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 25px; box-shadow: 0 8px 30px rgba(0,0,0,0.12); max-width: 90%;">
              
              <!-- Logo Winston -->
              <tr>
                <td style="padding: 35px 35px 0 35px; text-align: right;">
                  <span style="font-family: Arial, sans-serif; font-size: 32px; font-weight: bold; color: #0088CC; letter-spacing: -1px;">Winston</span>
                </td>
              </tr>
              
              <!-- Contenido principal -->
              <tr>
                <td style="padding: 20px 35px 40px 35px;">
                  
                  <!-- NOS ENCANTARÍA QUE CONOCIERA -->
                  <h1 style="font-family: Arial, sans-serif; font-size: 34px; font-weight: bold; margin: 0 0 20px 0; line-height: 1.1;">
                    <span style="color: #00A8E1;">NOS ENCANTARÍA</span><br>
                    <span style="color: ${isWinston ? '#00A8E1' : '#E53935'};">QUE CONOCIERA</span>
                  </h1>
                  
                  <!-- nuestro INSTITUTO -->
                  <p style="font-family: Arial, sans-serif; color: #00A8E1; font-size: 15px; margin: 0 0 5px 0;">
                    nuestro
                  </p>
                  <p style="font-family: Arial, sans-serif; color: #0066CC; font-size: 17px; font-weight: bold; margin: 0 0 25px 0;">
                    ${institucion}
                  </p>
                  
                  <!-- ¿Le gustaría agendar un recorrido? -->
                  <p style="font-family: Arial, sans-serif; color: #00A8E1; font-size: 15px; margin: 0 0 25px 0; line-height: 1.5;">
                    ¿Le gustaría agendar un recorrido por nuestras instalaciones?
                  </p>
                  
                  <!-- Escríbenos al -->
                  <p style="font-family: Arial, sans-serif; color: #0066CC; font-size: 14px; font-weight: bold; margin: 0 0 8px 0;">
                    Escríbenos al
                  </p>
                  
                  <!-- Número WhatsApp -->
                  <p style="margin: 0 0 25px 0;">
                    <a href="https://wa.me/${whatsappNumber}" style="font-family: Arial, sans-serif; color: #0066CC; font-size: 24px; font-weight: bold; text-decoration: none;">
                      <span style="font-size: 20px;">💬</span> ${whatsappDisplay}
                    </a>
                  </p>
                  
                  <!-- CON GUSTO -->
                  <p style="font-family: Arial, sans-serif; color: #0066CC; font-size: 16px; font-weight: bold; margin: 0 0 5px 0;">
                    CON GUSTO
                  </p>
                  <p style="font-family: Arial, sans-serif; color: #00A8E1; font-size: 15px; margin: 0 0 30px 0; line-height: 1.5;">
                    te ayudamos a reservar tu visita.
                  </p>
                  
                  <!-- Botón CONTÁCTANOS -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <a href="https://wa.me/${whatsappNumber}" style="display: inline-block; background-color: ${isWinston ? '#8BC34A' : '#E53935'}; color: #ffffff; text-decoration: none; padding: 14px 45px; border-radius: 30px; font-family: Arial, sans-serif; font-size: 15px; font-weight: bold;">
                          ➜ CONTÁCTANOS
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export function getEmailTemplate5d(nombre: string, plantel: string = 'winston'): string {
  // Configuración dinámica según plantel
  const isWinston = plantel === 'winston';
  const institucion = isWinston ? 'Instituto Winston Churchill' : 'Instituto Educativo Winston';
  const whatsappNumber = isWinston ? '528334378743' : '528333474507';
  const whatsappDisplay = isWinston ? '833 437 87 43' : '833 347 45 07';
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Descuento Especial - Winston</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #d8d8d8;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #d8d8d8; padding: 50px 20px;">
        <tr>
          <td align="center">
            <!-- Tarjeta principal -->
            <table width="450" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 25px; box-shadow: 0 8px 30px rgba(0,0,0,0.12); max-width: 90%;">
              
              <!-- Logo Winston -->
              <tr>
                <td style="padding: 35px 35px 0 35px; text-align: right;">
                  <span style="font-family: Arial, sans-serif; font-size: 32px; font-weight: bold; color: #0088CC; letter-spacing: -1px;">Winston</span>
                </td>
              </tr>
              
              <!-- Contenido principal -->
              <tr>
                <td style="padding: 20px 35px 40px 35px;">
                  
                  <!-- DESCUENTO ESPECIAL -->
                  <h1 style="font-family: Arial, sans-serif; color: #FF0000; font-size: 38px; font-weight: bold; margin: 0 0 25px 0; line-height: 1.1; text-align: center;">
                    DESCUENTO<br>ESPECIAL
                  </h1>
                  
                  <!-- AL INICIAR TU PROCESO DE ADMISIÓN HOY! -->
                  <p style="font-family: Arial, sans-serif; color: #0066CC; font-size: 16px; font-weight: bold; margin: 0 0 5px 0; text-align: center;">
                    AL INICIAR TU PROCESO
                  </p>
                  <p style="font-family: Arial, sans-serif; color: #00A8E1; font-size: 20px; font-weight: bold; margin: 0 0 5px 0; text-align: center;">
                    DE ADMISIÓN
                  </p>
                  <p style="font-family: Arial, sans-serif; color: #00A8E1; font-size: 36px; font-weight: bold; margin: 0 0 30px 0; text-align: center;">
                    HOY!
                  </p>
                  
                  <!-- Escríbenos al -->
                  <p style="font-family: Arial, sans-serif; color: #0066CC; font-size: 14px; font-weight: bold; margin: 0 0 8px 0;">
                    Escríbenos al
                  </p>
                  
                  <!-- Número WhatsApp -->
                  <p style="margin: 0 0 25px 0;">
                    <a href="https://wa.me/${whatsappNumber}" style="font-family: Arial, sans-serif; color: #0066CC; font-size: 24px; font-weight: bold; text-decoration: none;">
                      <span style="font-size: 20px;">💬</span> ${whatsappDisplay}
                    </a>
                  </p>
                  
                  <!-- DA EL PRIMER PASO -->
                  <p style="font-family: Arial, sans-serif; color: #00A8E1; font-size: 18px; font-weight: bold; margin: 0 0 8px 0;">
                    DA EL PRIMER PASO
                  </p>
                  <p style="font-family: Arial, sans-serif; color: #00A8E1; font-size: 15px; margin: 0 0 30px 0; line-height: 1.5;">
                    para formar parte del ${institucion}.
                  </p>
                  
                  <!-- Botón CONTÁCTANOS -->
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <a href="https://wa.me/${whatsappNumber}" style="display: inline-block; background-color: ${isWinston ? '#8BC34A' : '#E53935'}; color: #ffffff; text-decoration: none; padding: 14px 45px; border-radius: 30px; font-family: Arial, sans-serif; font-size: 15px; font-weight: bold;">
                          ➜ CONTÁCTANOS
                        </a>
                      </td>
                    </tr>
                  </table>
                  
                </td>
              </tr>
              
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

