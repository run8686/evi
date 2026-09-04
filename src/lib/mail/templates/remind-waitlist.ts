import { SITE } from "@/lib/constants";

import {
  CONFIRM_PATH,
  UNSUBSCRIBE_PATH,
  type ConfirmMail,
} from "./confirm-waitlist";

type ReminderMailInput = {
  token: string;
  firstName: string | null;
  unsubscribeToken: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** One reminder, scheduled 24 hours after an unconfirmed signup. */
export function remindWaitlistMail({
  token,
  firstName,
  unsubscribeToken,
}: ReminderMailInput): ConfirmMail {
  const url = `${SITE.url}${CONFIRM_PATH}?token=${encodeURIComponent(token)}`;
  const unsubscribeUrl = `${SITE.url}${UNSUBSCRIBE_PATH}?token=${encodeURIComponent(unsubscribeToken)}`;
  const greeting = firstName ? `Hallo ${firstName},` : "Hallo,";
  const subject = "Bitte bestätige noch kurz deine E-Mail-Adresse";

  const text = [
    greeting,
    "",
    "du hast dich vor Kurzem für den Early Access von Evi vorgemerkt.",
    "Deine E-Mail-Adresse ist noch nicht bestätigt.",
    "",
    "Wenn du auf die Liste möchtest, bestätige sie bitte hier:",
    url,
    "",
    "Der Bestätigungslink ist insgesamt 7 Tage gültig.",
    "",
    "Falls du dich nicht eingetragen hast, kannst du diese Nachricht ignorieren.",
    "Ohne Bestätigung wirst du nicht aufgenommen; die Anfrage wird nach 30 Tagen gelöscht.",
    "",
    `Adresse sofort entfernen: ${unsubscribeUrl}`,
    "",
    `Datenschutz: ${SITE.url}/datenschutz`,
    `Impressum: ${SITE.url}/impressum`,
  ].join("\n");

  const html = `<!doctype html>
<html lang="de" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;background-color:#ffffff;">
    <span style="display:none;max-height:0;max-width:0;opacity:0;overflow:hidden;font-size:1px;line-height:1px;color:#ffffff;">Dein Bestätigungslink für Evi ist noch gültig.</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:100%;border-collapse:collapse;background-color:#ffffff;">
      <tr>
        <td align="center" valign="top" bgcolor="#ffffff" style="background-color:#ffffff;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;">
          <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;">
            <tr>
              <td align="left" bgcolor="#ffffff" style="background-color:#ffffff;padding-top:48px;padding-right:24px;padding-bottom:52px;padding-left:24px;">
                <img src="https://www.evi-health.eu/assets/evi-logo-email.png" width="125" height="50" border="0" alt="evi" style="display:block;width:125px;height:50px;border:0;outline:none;text-decoration:none;">
                <h1 style="margin-top:44px;margin-right:0;margin-bottom:24px;margin-left:0;font-family:'Plus Jakarta Sans','Avenir Next',Avenir,'Segoe UI',Arial,Helvetica,sans-serif;font-size:30px;line-height:38px;font-weight:700;letter-spacing:-0.5px;color:#1c1b1b;">Noch kurz bestätigen.</h1>
                <p style="margin-top:0;margin-right:0;margin-bottom:20px;margin-left:0;font-family:'Plus Jakarta Sans','Avenir Next',Avenir,'Segoe UI',Arial,Helvetica,sans-serif;font-size:17px;line-height:28px;font-weight:400;color:#444748;">${escapeHtml(greeting)}</p>
                <p style="margin-top:0;margin-right:0;margin-bottom:24px;margin-left:0;font-family:'Plus Jakarta Sans','Avenir Next',Avenir,'Segoe UI',Arial,Helvetica,sans-serif;font-size:17px;line-height:28px;font-weight:400;color:#444748;">du hast dich vor Kurzem für den Early Access von Evi vorgemerkt. Deine E-Mail-Adresse ist noch nicht bestätigt.</p>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin-bottom:24px;">
                  <tr>
                    <td align="center" bgcolor="#1c1b1b" style="background-color:#1c1b1b;border-radius:999px;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;">
                      <a href="${url}" style="display:inline-block;padding-top:14px;padding-right:24px;padding-bottom:14px;padding-left:24px;font-family:'Plus Jakarta Sans','Avenir Next',Avenir,'Segoe UI',Arial,Helvetica,sans-serif;font-size:16px;line-height:20px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px;">E-Mail-Adresse bestätigen</a>
                    </td>
                  </tr>
                </table>
                <p style="margin-top:0;margin-right:0;margin-bottom:20px;margin-left:0;font-family:'Plus Jakarta Sans','Avenir Next',Avenir,'Segoe UI',Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;font-weight:400;color:#666666;">Der Bestätigungslink ist insgesamt 7 Tage gültig.</p>
                <p style="margin-top:0;margin-right:0;margin-bottom:20px;margin-left:0;font-family:'Plus Jakarta Sans','Avenir Next',Avenir,'Segoe UI',Arial,Helvetica,sans-serif;font-size:15px;line-height:24px;font-weight:400;color:#666666;">Falls du dich nicht eingetragen hast, kannst du diese Nachricht ignorieren. Ohne Bestätigung wirst du nicht aufgenommen; die Anfrage wird nach 30 Tagen gelöscht.</p>
                <p style="margin-top:0;margin-right:0;margin-bottom:0;margin-left:0;font-family:'Plus Jakarta Sans','Avenir Next',Avenir,'Segoe UI',Arial,Helvetica,sans-serif;font-size:13px;line-height:22px;font-weight:400;color:#666666;"><a href="${unsubscribeUrl}" style="color:#666666;">Adresse entfernen</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="${SITE.url}/datenschutz" style="color:#666666;">Datenschutz</a>&nbsp;&nbsp;·&nbsp;&nbsp;<a href="${SITE.url}/impressum" style="color:#666666;">Impressum</a></p>
              </td>
            </tr>
          </table>
          <!--[if mso]></td></tr></table><![endif]-->
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return {
    subject,
    html,
    text,
    headers: { "List-Unsubscribe": `<${unsubscribeUrl}>` },
  };
}
