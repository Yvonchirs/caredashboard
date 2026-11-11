import type { MailMessage } from './mail.service.js';

const escape = (value: string) => value.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

function layout(heading: string, intro: string, link: string, action: string, footer: string) {
  const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;color:#090015">
  <div style="background:#241E4E;padding:18px 24px;color:#fff;font-weight:bold;letter-spacing:.04em">CARE Rwanda · Activity Board</div>
  <div style="padding:24px;background:#FFF8EE">
    <h1 style="font-size:22px;margin:0 0 12px">${escape(heading)}</h1>
    <p style="line-height:1.5;margin:0 0 20px">${escape(intro)}</p>
    <p style="margin:0 0 20px"><a href="${escape(link)}" style="background:#EB7100;color:#090015;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:bold;display:inline-block">${escape(action)}</a></p>
    <p style="font-size:13px;color:#3d3650;line-height:1.5;margin:0 0 8px">Or paste this link into your browser:<br>${escape(link)}</p>
    <p style="font-size:13px;color:#3d3650;line-height:1.5;margin:0">${escape(footer)}</p>
  </div></div>`;
  return { html, text: `${heading}\n\n${intro}\n\n${action}: ${link}\n\n${footer}\n` };
}

export function welcomeEmail(name: string, to: string, link: string, hours: number): MailMessage {
  const { html, text } = layout(
    `Welcome, ${name.split(' ')[0]}`,
    'An account has been created for you on the CARE Rwanda Activity Board, where you log field activities and say where you are working. Choose your password to get started.',
    link,
    'Set your password',
    `This link works for ${hours} hours. If you weren't expecting this email, you can ignore it.`,
  );
  return { to, subject: 'Your CARE Rwanda Activity Board account', text, html };
}

export function resetEmail(name: string, to: string, link: string, hours: number): MailMessage {
  const { html, text } = layout(
    'Reset your password',
    `Hi ${name.split(' ')[0]}, we received a request to reset your Activity Board password. Choose a new one with the button below.`,
    link,
    'Choose a new password',
    `This link works for ${hours} ${hours === 1 ? 'hour' : 'hours'} and can be used once. If you didn't ask for it, you can ignore this email and your password stays the same.`,
  );
  return { to, subject: 'Reset your Activity Board password', text, html };
}
