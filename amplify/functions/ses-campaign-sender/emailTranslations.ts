/**
 * Email translations for SES campaign invitations
 * Single source of truth for email content in multiple languages
 */

export interface EmailTemplate {
  subject: string;
  greeting: string;
  description: string;
  valueProposition: string;
  invitation: string;
  linkNote: string;
  closing: string;
  signature: string;
}

export const EMAIL_TRANSLATIONS: Record<string, EmailTemplate> = {
  es: {
    subject: 'Invitación a Perkins Intelligence',
    greeting: 'Hola {firstName},',
    description: 'Perkins es una herramienta de inteligencia de mercado que te permite recibir información en tiempo real sobre los <strong>países, industrias y compañías</strong> que tú definas.',
    valueProposition: 'Es la <strong>potencia de una terminal de noticias financiera</strong>, pero 100% personalizable y abierta a profesionales como tú.',
    invitation: 'Crea tu cuenta gratuita y configura Perkins de acuerdo con tus preferencias aquí 👉 <a href="https://www.perkinsintel.com">https://www.perkinsintel.com</a>',
    linkNote: '(Si prefieres no hacer clic en enlaces directos, <strong>puedes escribir</strong> <i>perkinsintel.com</i> <strong>en tu navegador</strong> e ingresar desde allí).',
    closing: 'Nos encantaría conocer tu opinión una vez que la pruebes.',
    signature: 'Saludos cordiales,\n\n<strong>Equipo Perkins Intelligence</strong>\n<a href="mailto:info@perkinsintel.com">info@perkinsintel.com</a>',
  },
  en: {
    subject: 'Invitation to Perkins Intelligence',
    greeting: 'Hello {firstName},',
    description: 'Perkins is a market intelligence tool that allows you to receive real-time information about the <strong>countries, industries, and companies</strong> you define.',
    valueProposition: 'It\'s the <strong>power of a financial news terminal</strong>, but 100% customizable and open to professionals like you.',
    invitation: 'Create your free account and configure Perkins according to your preferences here 👉 <a href="https://www.perkinsintel.com">https://www.perkinsintel.com</a>',
    linkNote: '(If you prefer not to click direct links, you can <strong>type</strong> <i>perkinsintel.com</i> <strong>in your browser</strong> and enter from there).',
    closing: 'We\'d love to hear your feedback once you try it.',
    signature: 'Best regards,\n\n<strong>Perkins Intelligence Team</strong>\n<a href="mailto:info@perkinsintel.com">info@perkinsintel.com</a>',
  },
  pt: {
    subject: 'Convite para Perkins Intelligence',
    greeting: 'Olá {firstName},',
    description: 'Perkins é uma ferramenta de inteligência de mercado que permite receber informações em tempo real sobre os <strong>países, indústrias e empresas</strong> que você definir.',
    valueProposition: 'É o <strong>poder de um terminal de notícias financeiras</strong>, mas 100% personalizável e aberto a profissionais como você.',
    invitation: 'Cria sua conta gratuita e configura o Perkins de acordo com suas preferências aqui 👉 <a href="https://www.perkinsintel.com">https://www.perkinsintel.com</a>',
    linkNote: '(Se você preferir não clicar em links diretos, pode <strong>digitar</strong> <i>perkinsintel.com</i> <strong>no seu navegador</strong> e entrar a partir daí).',
    closing: 'Adoraríamos conhecer sua opinião assim que você experimentar.',
    signature: 'Atenciosamente,\n\n<strong>Equipe Perkins Intelligence</strong>\n<a href="mailto:info@perkinsintel.com">info@perkinsintel.com</a>',
  },
};

/**
 * Get email template for a specific language
 * @param language - Language code ('es', 'en', or 'pt')
 * @returns Email template for the specified language, defaults to Spanish if invalid
 */
export function getEmailTemplate(language: string = 'es'): EmailTemplate {
  const lang = language.toLowerCase();
  return EMAIL_TRANSLATIONS[lang] || EMAIL_TRANSLATIONS.es;
}

/**
 * Build email content from template with personalized first name
 * @param firstName - Contact's first name
 * @param language - Language code ('es', 'en', or 'pt')
 * @returns Object with subject and body strings (HTML format)
 */
export function buildEmailContent(firstName: string, language: string = 'es'): { subject: string; body: string } {
  const template = getEmailTemplate(language);
  
  const subject = template.subject;
  const greeting = template.greeting.replace('{firstName}', firstName);
  
  // Convert signature newlines to HTML breaks
  const signatureHtml = template.signature.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
  
  // Build HTML email content
  const body = `<html>
<body>
<p>${greeting}</p>
<p>${template.description}</p>
<p>${template.valueProposition}</p>
<p>${template.invitation}</p>
<p>${template.linkNote}</p>
<p>${template.closing}</p>
<p>${signatureHtml}</p>
</body>
</html>`;
  
  return { subject, body };
}

