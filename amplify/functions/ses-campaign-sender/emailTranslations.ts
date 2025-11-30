/**
 * Email translations for SES campaign invitations
 * Single source of truth for email content in multiple languages
 */

export interface EmailTemplate {
  subject: string;
  greeting: string;
  intro: string;
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
    intro: 'Te escribo porque estamos lanzando la <b>versión profesional de Perkins Intelligence.</b>',
    description: 'Perkins es una herramienta de inteligencia de mercado que te permite recibir información en tiempo real sobre los <b>países, industrias y compañías que tú definas.</b>',
    valueProposition: 'Es la potencia de una terminal de noticias financiera, pero 100% personalizable y abierta a profesionales como tú.',
    invitation: 'Te invito a crear tu cuenta gratuita y configurar Perkins de acuerdo con tus preferencias aquí: https://www.perkinsintel.com',
    linkNote: '(Si prefieres no hacer clic en enlaces directos, puedes escribir perkinsintel.com en tu navegador e ingresar desde allí).',
    closing: 'Nos encantaría conocer tu opinión una vez que la pruebes.',
    signature: 'Saludos cordiales,\n\nEquipo Perkins Intelligence\ninfo@perkinsintel.com',
  },
  en: {
    subject: 'Invitation to Perkins Intelligence',
    greeting: 'Hello {firstName},',
    intro: 'I\'m writing because we\'re launching the professional version of Perkins Intelligence.',
    description: 'Perkins is a market intelligence tool that allows you to receive real-time information about the countries, industries, and companies you define.',
    valueProposition: 'It\'s the power of a financial news terminal, but 100% customizable and open to professionals like you.',
    invitation: 'I invite you to create your free account and configure Perkins according to your preferences here: https://www.perkinsintel.com',
    linkNote: '(If you prefer not to click direct links, you can type perkinsintel.com in your browser and enter from there).',
    closing: 'We\'d love to hear your feedback once you try it.',
    signature: 'Best regards,\n\nPerkins Intelligence Team\ninfo@perkinsintel.com',
  },
  pt: {
    subject: 'Convite para Perkins Intelligence',
    greeting: 'Olá {firstName},',
    intro: 'Estou escrevendo porque estamos lançando a versão profissional do Perkins Intelligence.',
    description: 'Perkins é uma ferramenta de inteligência de mercado que permite receber informações em tempo real sobre os países, indústrias e empresas que você definir.',
    valueProposition: 'É o poder de um terminal de notícias financeiras, mas 100% personalizável e aberto a profissionais como você.',
    invitation: 'Convido você a criar sua conta gratuita e configurar o Perkins de acordo com suas preferências aqui: https://www.perkinsintel.com',
    linkNote: '(Se você preferir não clicar em links diretos, pode digitar perkinsintel.com no seu navegador e entrar a partir daí).',
    closing: 'Adoraríamos conhecer sua opinião assim que você experimentar.',
    signature: 'Atenciosamente,\n\nEquipe Perkins Intelligence\ninfo@perkinsintel.com',
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
 * @returns Object with subject and body strings
 */
export function buildEmailContent(firstName: string, language: string = 'es'): { subject: string; body: string } {
  const template = getEmailTemplate(language);
  
  const subject = template.subject;
  const greeting = template.greeting.replace('{firstName}', firstName);
  
  const body = [
    greeting,
    '',
    template.intro,
    '',
    template.description,
    '',
    template.valueProposition,
    '',
    template.invitation,
    '',
    template.linkNote,
    '',
    template.closing,
    '',
    template.signature,
  ].join('\n');
  
  return { subject, body };
}

