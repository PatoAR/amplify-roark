/**
 * Referral message translations for Cognito custom message handler
 * Single source of truth for referral email content in multiple languages
 */

export interface ReferralMessageTemplate {
  subject: string;
  greeting: string;
  thankYou: string;
  referralCodeMessage: string;
  threeMonthsFree: string;
  keepFreeMessage: string;
  verifyInstructions: string;
  ignoreMessage: string;
  closing: string;
  signature: string;
}

export const REFERRAL_TRANSLATIONS: Record<string, ReferralMessageTemplate> = {
  en: {
    subject: 'Welcome to Perkins! Please Verify Your Email',
    greeting: 'Hello,',
    thankYou: 'Thank you for signing up for Perkins!',
    referralCodeMessage: 'You signed up using a referral code: <strong>{referralCode}</strong>',
    threeMonthsFree: "You'll get 3 months of free access!",
    keepFreeMessage: 'Keep Perkins free forever through referrals! Invite friends and earn 3 additional months for each successful referral, or subscribe for unlimited access without referrals.',
    verifyInstructions: 'To verify your email address, please use the following code:',
    ignoreMessage: "If you didn't sign up for this service, please ignore this email.",
    closing: 'Sincerely,',
    signature: 'The Perkins Team',
  },
  es: {
    subject: '¡Bienvenido a Perkins! Por favor verifica tu email',
    greeting: 'Hola,',
    thankYou: '¡Gracias por registrarte en Perkins!',
    referralCodeMessage: 'Te registraste usando un código de referido: <strong>{referralCode}</strong>',
    threeMonthsFree: '¡Obtendrás 3 meses de acceso gratis!',
    keepFreeMessage: '¡Mantén Perkins gratis para siempre a través de referidos! Invita amigos y gana 3 meses adicionales por cada referido exitoso, o suscríbete para acceso ilimitado sin referidos.',
    verifyInstructions: 'Para verificar tu dirección de email, por favor usa el siguiente código:',
    ignoreMessage: 'Si no te registraste en este servicio, por favor ignora este email.',
    closing: 'Atentamente,',
    signature: 'El Equipo de Perkins',
  },
  pt: {
    subject: 'Bem-vindo ao Perkins! Por favor verifique seu email',
    greeting: 'Olá,',
    thankYou: 'Obrigado por se cadastrar no Perkins!',
    referralCodeMessage: 'Você se cadastrou usando um código de referido: <strong>{referralCode}</strong>',
    threeMonthsFree: 'Você ganhará 3 meses de acesso grátis!',
    keepFreeMessage: 'Mantenha Perkins grátis para sempre através de referidos! Convide amigos e ganhe 3 meses adicionais para cada referido bem-sucedido, ou assine para acesso ilimitado sem referidos.',
    verifyInstructions: 'Para verificar seu endereço de email, por favor use o seguinte código:',
    ignoreMessage: 'Se você não se cadastrou neste serviço, por favor ignore este email.',
    closing: 'Atenciosamente,',
    signature: 'A Equipe Perkins',
  },
};

/**
 * Get referral message template for a specific language
 * @param language - Language code ('es', 'en', or 'pt')
 * @returns Referral message template for the specified language, defaults to English if invalid
 */
export function getReferralTemplate(language: string = 'en'): ReferralMessageTemplate {
  const lang = language.toLowerCase();
  return REFERRAL_TRANSLATIONS[lang] || REFERRAL_TRANSLATIONS.en;
}

/**
 * Build referral message HTML content
 * @param referralCode - Optional referral code
 * @param verificationCode - Email verification code
 * @param language - Language code ('es', 'en', or 'pt')
 * @returns HTML string for the referral email
 */
export function buildReferralMessage(
  referralCode: string | null,
  verificationCode: string,
  language: string = 'en'
): { subject: string; message: string } {
  const template = getReferralTemplate(language);
  
  const subject = template.subject;
  
  // Build referral message part
  let referralMessageHtml = '';
  if (referralCode) {
    referralMessageHtml = `
        <p>${template.referralCodeMessage.replace('{referralCode}', referralCode)}</p>
        <p><b>${template.threeMonthsFree}</b></p>
        <p><b>${template.keepFreeMessage}</b></p>
      `;
  } else {
    referralMessageHtml = `
        <p><b>${template.threeMonthsFree}</b></p>
        <p><b>${template.keepFreeMessage}</b></p>
      `;
  }
  
  // Build full email HTML
  const message = `
      <html>
        <body>
          <p>${template.greeting}</p>
          <p>${template.thankYou}</p>
          ${referralMessageHtml}
          <p>${template.verifyInstructions}</p>
          <h3>${verificationCode}</h3>
          <p>${template.ignoreMessage}</p>
          <p>${template.closing}</p>
          <p>${template.signature}</p>
        </body>
      </html>
    `;
  
  return { subject, message };
}

