/**
 * Sent after the address has completed double opt-in.
 *
 * This is deliberately a separate mail from the address-confirmation mail:
 * before the POST confirmation succeeds, saying "Du bist auf der Liste" would
 * be false. It is static on purpose so the version in source control matches
 * the transactional template reviewed in Resend.
 */

export type ConfirmedWaitlistMail = {
  subject: string;
  html: string;
  text: string;
};

export const CONFIRMED_WAITLIST_RESEND_ALIAS =
  "evi-early-access-confirmed";

export function confirmedWaitlistMail(): ConfirmedWaitlistMail {
  const subject = "Du bist auf der Liste.";

  const text = [
    "Du bist auf der Liste.",
    "",
    "Danke, dass du dich für den Early Access von Evi eingetragen hast.",
    "",
    "Manchmal braucht es nicht viel.",
    "Nur einen Ort, an dem Gedanken sein dürfen, wie sie gerade sind.",
    "",
    "Wir arbeiten gerade daran, Evi für dich bereit zu machen.",
    "Sobald dein Zugang verfügbar ist, melden wir uns bei dir.",
    "",
    "Bis bald,",
    "Dein evi Team",
  ].join("\n");

  const html = `<!doctype html>
<html lang="de" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="x-apple-disable-message-reformatting">
    <title>Du bist auf der Liste.</title>
    <!--[if mso]>
      <noscript>
        <xml>
          <o:OfficeDocumentSettings>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
      </noscript>
    <![endif]-->
  </head>
  <body style="margin:0;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;background-color:#ffffff;">
    <span style="display:none;max-height:0;max-width:0;opacity:0;overflow:hidden;font-size:1px;line-height:1px;color:#ffffff;">Schön, dass du Evi so früh begleitest.</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#ffffff" style="width:100%;border-collapse:collapse;background-color:#ffffff;">
      <tr>
        <td align="center" valign="top" bgcolor="#ffffff" style="background-color:#ffffff;padding-top:0;padding-right:0;padding-bottom:0;padding-left:0;">
          <!--[if mso]><table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;border-collapse:collapse;">
            <tr>
              <td align="left" bgcolor="#ffffff" style="background-color:#ffffff;padding-top:48px;padding-right:24px;padding-bottom:52px;padding-left:24px;">
                <img src="https://www.evi-health.eu/assets/evi-logo-email.png" width="125" height="50" border="0" alt="evi" style="display:block;width:125px;height:50px;border:0;outline:none;text-decoration:none;">
                <h1 style="margin-top:44px;margin-right:0;margin-bottom:24px;margin-left:0;font-family:'Plus Jakarta Sans','Avenir Next',Avenir,'Segoe UI',Arial,Helvetica,sans-serif;font-size:32px;line-height:40px;font-weight:700;letter-spacing:-0.6px;color:#1c1b1b;">Du bist auf der Liste.</h1>
                <p style="margin-top:0;margin-right:0;margin-bottom:24px;margin-left:0;font-family:'Plus Jakarta Sans','Avenir Next',Avenir,'Segoe UI',Arial,Helvetica,sans-serif;font-size:17px;line-height:28px;font-weight:400;color:#444748;">Danke, dass du dich für den Early Access von Evi eingetragen hast.</p>
                <p style="margin-top:0;margin-right:0;margin-bottom:24px;margin-left:0;font-family:'Plus Jakarta Sans','Avenir Next',Avenir,'Segoe UI',Arial,Helvetica,sans-serif;font-size:17px;line-height:28px;font-weight:400;color:#444748;">Manchmal braucht es nicht viel.<br>Nur einen Ort, an dem Gedanken sein dürfen, wie sie gerade sind.</p>
                <p style="margin-top:0;margin-right:0;margin-bottom:30px;margin-left:0;font-family:'Plus Jakarta Sans','Avenir Next',Avenir,'Segoe UI',Arial,Helvetica,sans-serif;font-size:17px;line-height:28px;font-weight:400;color:#444748;">Wir arbeiten gerade daran, Evi für dich bereit zu machen.<br>Sobald dein Zugang verfügbar ist, melden wir uns bei dir.</p>
                <p style="margin-top:0;margin-right:0;margin-bottom:0;margin-left:0;font-family:'Plus Jakarta Sans','Avenir Next',Avenir,'Segoe UI',Arial,Helvetica,sans-serif;font-size:17px;line-height:28px;font-weight:400;color:#444748;"><strong style="font-weight:700;color:#1c1b1b;">Bis bald,</strong><br>Dein evi Team</p>
              </td>
            </tr>
          </table>
          <!--[if mso]></td></tr></table><![endif]-->
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { subject, html, text };
}
