import type { Metadata } from "next";

import {
  PageShell,
  PendingNotice,
  Prose,
} from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Angaben gemäß § 5 DDG.",
  robots: { index: false, follow: true },
};

/**
 * An Impressum requires real, legally binding details: the operating entity,
 * its address, who represents it, the register entry and a VAT ID. None of
 * that can be filled in from the outside — inventing it would produce a false
 * legal record — so the structure is here and the values are not.
 */
export default function ImpressumPage() {
  return (
    <PageShell title="Impressum">
      <PendingNotice>
        <strong className="font-semibold text-text-primary">
          Diese Angaben werden vor dem öffentlichen Start ergänzt.
        </strong>{" "}
        Die Pflichtangaben müssen mit den tatsächlichen Unternehmensdaten
        gefüllt werden und dürfen nicht geschätzt werden.
      </PendingNotice>

      <Prose heading="Angaben gemäß § 5 DDG">
        <p>
          Zu ergänzen: Name und Rechtsform des Anbieters, Anschrift,
          Vertretungsberechtigte, Registergericht und Registernummer sowie —
          falls vorhanden — die Umsatzsteuer-Identifikationsnummer gemäß § 27a
          UStG.
        </p>
      </Prose>

      <Prose heading="Kontakt">
        <p>Zu ergänzen: E-Mail-Adresse und Telefonnummer für Rückfragen.</p>
      </Prose>

      <Prose heading="Verantwortlich für den Inhalt">
        <p>
          Zu ergänzen: verantwortliche Person nach § 18 Abs. 2 MStV mit
          Anschrift.
        </p>
      </Prose>

      <Prose heading="Hinweis">
        <p>
          Evi ist ein Angebot zur Orientierung und ersetzt keine
          Psychotherapie, keine medizinische Behandlung und keinen Krisendienst.
          Evi stellt keine Diagnosen.
        </p>
      </Prose>
    </PageShell>
  );
}
