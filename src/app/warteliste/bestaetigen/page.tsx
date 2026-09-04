import type { Metadata } from "next";
import Link from "next/link";

import { PageShell, Prose } from "@/components/layout/page-shell";
import { buttonStyles } from "@/components/ui/button";
import { confirmWaitlist } from "@/lib/waitlist/confirm";

export const metadata: Metadata = {
  title: "Warteliste bestätigen",
  description: "Bestätige deinen Platz auf der Evi-Warteliste.",
  // Confirmation URLs carry a token and must never end up in an index.
  robots: { index: false, follow: false },
};

function first(value: string | string[] | undefined): string | null {
  if (typeof value === "string") return value.length > 0 ? value : null;
  if (Array.isArray(value)) return first(value[0]);
  return null;
}

/**
 * Double opt-in confirmation.
 *
 * A GET only ever renders a button — it never confirms anything. Mail scanners
 * prefetch links, so confirming on GET would mark people as confirmed who
 * never clicked, and the proof of consent would be worthless. The confirmation
 * happens on submit.
 */
export default async function ConfirmWaitlistPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = first(params.status);
  const token = first(params.token);

  if (status) return <Result status={status} />;
  if (token) return <ConfirmPrompt token={token} />;
  return <Result status="invalid" />;
}

function ConfirmPrompt({ token }: { token: string }) {
  return (
    <PageShell title="Fast geschafft">
      <Prose>
        <p>
          Ein Klick noch: Bestätige, dass diese E-Mail-Adresse dir gehört.
          Danach stehst du auf der Warteliste und wir melden uns, sobald ein
          Platz für dich frei ist.
        </p>
      </Prose>

      <form action={confirmWaitlist}>
        <input type="hidden" name="token" value={token} />
        <button type="submit" className={buttonStyles({ size: "lg" })}>
          Platz bestätigen
        </button>
      </form>
    </PageShell>
  );
}

type ResultCopy = {
  title: string;
  body: string;
  /** Shown only where trying again is actually the right move. */
  retry?: boolean;
};

const RESULTS: Record<string, ResultCopy> = {
  confirmed: {
    title: "Bestätigt. Du bist dabei.",
    body: "Wir öffnen Evi schrittweise für erste Tester:innen und melden uns, sobald ein Platz für dich frei ist. Kein Abo, keine Kosten, keine Verpflichtung.",
  },
  already: {
    title: "Das war schon bestätigt.",
    body: "Du stehst bereits auf der Warteliste — du musst nichts weiter tun. Wir melden uns, sobald ein Platz für dich frei ist.",
  },
  expired: {
    title: "Dieser Link ist abgelaufen.",
    body: "Bestätigungslinks gelten sieben Tage. Trag dich einfach noch einmal ein, dann schicken wir dir einen neuen.",
    retry: true,
  },
  invalid: {
    title: "Dieser Link funktioniert nicht.",
    body: "Möglicherweise ist er unvollständig kopiert worden oder es gibt inzwischen einen neueren. Trag dich einfach noch einmal ein.",
    retry: true,
  },
  unavailable: {
    title: "Das hat gerade nicht geklappt.",
    body: "Wir konnten deine Bestätigung im Moment nicht speichern. Bitte versuch es in ein paar Minuten noch einmal — dein Link bleibt gültig.",
  },
};

function Result({ status }: { status: string }) {
  const copy = RESULTS[status] ?? RESULTS.invalid;

  return (
    <PageShell title={copy.title}>
      <Prose>
        <p>{copy.body}</p>
      </Prose>

      {copy.retry ? (
        <Link href="/#early-access" className={buttonStyles({ size: "lg" })}>
          Zurück zur Anmeldung
        </Link>
      ) : (
        <Link
          href="/"
          className="font-medium text-link underline underline-offset-2"
        >
          Zurück zur Startseite
        </Link>
      )}
    </PageShell>
  );
}
