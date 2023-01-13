export const SENDGRID_MAIL = 'SENDGRID_MAIL';

const TemplateKeys = ['SENDGRID_MAIL_VERIFICATION_TEMPLATE', 'SENDGRID_RESET_PASSWORD_MAIL_TEMPLATE'] as const;
export type TemplateKey = typeof TemplateKeys[number]
