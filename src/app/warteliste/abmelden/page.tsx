import type { Metadata } from "next";
import Link from "next/link";

import { PageShell, Prose } from "@/components/layout/page-shell";
import { buttonStyles } from "@/components/ui/button";
import { unsubscribeFromWaitlist } from "@/lib/waitlist/unsubscribe";

export const metadata: Metadata = {
  title: "Von der Warteliste abmelden",
  description: "Entferne deine E-Mail-Adresse von der Evi-Warteliste.",
  robots: { index: false, follow: false },
};

function first(value: string | string[] | undefined): string | null {
  if (typeof value === "string") return value.length > 0 ? value : null;
  if (Array.isArray(value)) return first(value[0]);
  return null;
}

/**
 * Removing an address from the waitlist.
 *
 * A GET only ever renders a button. Mail security scanners prefetch links, so
 * deleting on GET would let a corporate gateway quietly remove people who
 * never asked to be removed.
 */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const status = first(params.status);
  const token = first(params.token);

  if (status) return <Result status={status} />;
  if (token) return <UnsubscribePrompt token={token} />;
  return <Result status="not_listed" />;
}

function UnsubscribePrompt({ token }: { token: string }) {
  return (
    <PageShell title="Adresse entfernen">
      <Prose>
        <p>
          Wir löschen deine E-Mail-Adresse dann vollständig aus der Warteliste.
          Das lässt sich nicht rückgängig machen — du kannst dich aber jederzeit
          wieder eintragen.
        </p>
      </Prose>

      <form action={unsubscribeFromWaitlist}>
        <input type="hidden" name="token" value={token} />
        <button
          type="submit"
          className={buttonStyles({ variant: "secondary", size: "lg" })}
        >
          Adresse endgültig löschen
        </button>
      </form>
    </PageShell>
  );
}

type ResultCopy = { title: string; body: string };

const RESULTS: Record<string, ResultCopy> = {
  removed: {
    title: "Erledigt. Deine Adresse ist gelöscht.",
    body: "Wir haben deine E-Mail-Adresse vollständig aus der Warteliste entfernt und schreiben dir nicht mehr. Wenn du es dir anders überlegst, kannst du dich jederzeit wieder eintragen.",
  },
  // Deliberately the same answer for an unknown token and an already-deleted
  // row: from where the person stands those are one state, and "your link is
  // broken" would be both alarming and untrue.
  not_listed: {
    title: "Diese Adresse steht nicht auf der Warteliste.",
    body: "Entweder wurde sie bereits entfernt oder sie stand nie darauf. In beiden Fällen musst du nichts weiter tun — wir schreiben dir nicht.",
  },
  unavailable: {
    title: "Das hat gerade nicht geklappt.",
    body: "Wir konnten die Abmeldung im Moment nicht ausführen. Bitte versuch es in ein paar Minuten noch einmal — dein Link bleibt gültig.",
  },
};

function Result({ status }: { status: string }) {
  const copy = RESULTS[status] ?? RESULTS.not_listed;

  return (
    <PageShell title={copy.title}>
      <Prose>
        <p>{copy.body}</p>
      </Prose>
      <Link
        href="/"
        className="font-medium text-link underline underline-offset-2"
      >
        Zurück zur Startseite
      </Link>
    </PageShell>
  );
}
