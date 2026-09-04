import { SITE } from "@/lib/constants";

/**
 * The double opt-in mail.
 *
 * The only mail a person receives before they have confirmed anything, so it
 * has one job: make it obvious what is being confirmed, and make ignoring it
 * an equally valid choice. No tracking pixel, no "you're almost there!"
 * pressure.
 *
 * It does load one image: the logo, from our own domain, for recognition. That
 * is a deliberate trade-off and not free — a remote image tells the server that
 * and when the mail was opened, before the person has confirmed anything. It is
 * the same file the two later mails already load, it carries no identifier in
 * its URL, and the privacy policy names it. Nothing else may be added here: a
 * second image, or one with a per-recipient URL, turns this into open tracking.
 *
 * Every client that matters renders the text part when HTML is blocked, so
 * both carry the same link and the same wording, and the logo is decorative
 * (empty alt) so a blocked image costs nothing.
 */

export const CONFIRM_PATH = "/warteliste/bestaetigen";
export const UNSUBSCRIBE_PATH = "/warteliste/abmelden";

type ConfirmMailInput = {
  /** Raw token, not the hash. Only ever lives in this link. */
  token: string;
  /** Optional, only to say hello properly. */
  firstName: string | null;
  /** Stable per address, so links in older mails keep working. */
  unsubscribeToken: string;
};

export type ConfirmMail = {
  subject: string;
  html: string;
  text: string;
  /** List-Unsubscribe, so mail clients can offer it in their own chrome. */
  headers: Record<string, string>;
};

/** Brand tokens, inlined because mail clients drop stylesheets. */
const ACCENT = "#5b52bf";
const TEXT = "#1c1b1b";
const MUTED = "#666666";
const BG = "#f9f8f6";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function confirmWaitlistMail({
  token,
  firstName,
  unsubscribeToken,
}: ConfirmMailInput): ConfirmMail {
  const url = `${SITE.url}${CONFIRM_PATH}?token=${encodeURIComponent(token)}`;
  const unsubscribeUrl = `${SITE.url}${UNSUBSCRIBE_PATH}?token=${encodeURIComponent(unsubscribeToken)}`;
  const greeting = firstName ? `Hallo ${firstName},` : "Hallo,";

  const subject = "Bestätige deinen Platz auf der Evi-Warteliste";

  const text = [
    greeting,
    "",
    "du hast dich für den Early Access von Evi vorgemerkt. Bestätige bitte kurz,",
    "dass diese E-Mail-Adresse dir gehört:",
    "",
    url,
    "",
    "Danach melden wir uns, sobald ein Platz für dich frei ist. Kein Abo, keine",
    "Kosten, keine Verpflichtung.",
    "",
    "Wenn du dich nicht vorgemerkt hast, ignoriere diese E-Mail einfach. Ohne",
    "Bestätigung passiert nichts und wir löschen die Anfrage nach 30 Tagen.",
    "",
    "Du willst die Adresse sofort entfernt haben? Hier entlang:",
    unsubscribeUrl,
    "",
    "---",
    "Evi ersetzt keine Psychotherapie oder medizinische Behandlung und stellt",
    "keine Diagnose.",
    "",
    `Datenschutz: ${SITE.url}/datenschutz`,
    `Impressum: ${SITE.url}/impressum`,
  ].join("\n");

  const html = `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;padding:0;background-color:${BG};">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      Ein Klick bestätigt deinen Platz auf der Warteliste.
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${BG};">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#ffffff;border-radius:20px;padding:32px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
            <tr>
              <td style="font-size:17px;line-height:1.6;color:${TEXT};">
                <img src="${SITE.url}/assets/evi-logo-email.png" width="125" height="50" border="0" alt="" style="display:block;width:125px;height:50px;border:0;outline:none;text-decoration:none;margin:0 0 28px;" />
                <p style="margin:0 0 16px;">${escapeHtml(greeting)}</p>
                <p style="margin:0 0 16px;">
                  du hast dich für den Early Access von Evi vorgemerkt. Bestätige
                  bitte kurz, dass diese E-Mail-Adresse dir gehört.
                </p>
                <p style="margin:0 0 28px;">
                  <a href="${url}" style="display:inline-block;background-color:${ACCENT};color:#ffffff;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:600;font-size:16px;">Platz bestätigen</a>
                </p>
                <p style="margin:0 0 24px;font-size:15px;color:${MUTED};">
                  Danach melden wir uns, sobald ein Platz für dich frei ist. Kein
                  Abo, keine Kosten, keine Verpflichtung.
                </p>
                <p style="margin:0 0 24px;font-size:15px;color:${MUTED};">
                  Wenn du dich nicht vorgemerkt hast, ignoriere diese E-Mail
                  einfach. Ohne Bestätigung passiert nichts und wir löschen die
                  Anfrage nach 30 Tagen. Du kannst die Adresse auch
                  <a href="${unsubscribeUrl}" style="color:${ACCENT};">sofort entfernen lassen</a>.
                </p>
                <p style="margin:0 0 24px;font-size:14px;color:${MUTED};word-break:break-all;">
                  Falls der Button nicht funktioniert:<br />
                  <a href="${url}" style="color:${ACCENT};">${escapeHtml(url)}</a>
                </p>
                <hr style="border:none;border-top:1px solid #ebe7e6;margin:0 0 20px;" />
                <p style="margin:0 0 12px;font-size:13px;line-height:1.6;color:${MUTED};">
                  Evi ersetzt keine Psychotherapie oder medizinische Behandlung
                  und stellt keine Diagnose.
                </p>
                <p style="margin:0;font-size:13px;color:${MUTED};">
                  <a href="${SITE.url}/datenschutz" style="color:${MUTED};">Datenschutz</a>
                  &nbsp;·&nbsp;
                  <a href="${SITE.url}/impressum" style="color:${MUTED};">Impressum</a>
                  &nbsp;·&nbsp;
                  <a href="${unsubscribeUrl}" style="color:${MUTED};">Abmelden</a>
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return {
    subject,
    html,
    text,
    // URL form without List-Unsubscribe-Post on purpose: one-click
    // unsubscribing (RFC 8058) requires a POST endpoint, and promising one that
    // does not exist is worse than not advertising it. It has to be added
    // before the first actual newsletter send.
    headers: { "List-Unsubscribe": `<${unsubscribeUrl}>` },
  };
}
