import type { Metadata } from "next";

import {
  PageShell,
  PendingNotice,
  Prose,
} from "@/components/layout/page-shell";

export const metadata: Metadata = {
  title: "Datenschutz",
  description:
    "Welche Daten diese Seite verarbeitet, wofür und auf welcher Grundlage.",
  robots: { index: false, follow: true },
};

/**
 * Factual description of what this page actually does with data — accurate as
 * of the current implementation, and verifiable in the source.
 *
 * The formal, legally reviewed Datenschutzerklärung still has to be written by
 * a human: it needs the controller's identity, legal bases, retention periods,
 * processor agreements and the hosting setup. Inventing that text would be
 * fabricating a legal document, so it is marked as pending instead.
 */
export default function DatenschutzPage() {
  return (
    <PageShell
      title="Datenschutz"
      intro="Evi entsteht in einem sensiblen Bereich. Deshalb hier zuerst konkret, was diese Seite tatsächlich verarbeitet."
    >
      <PendingNotice>
        <strong className="font-semibold text-text-primary">
          Hinweis zum Stand dieser Seite:
        </strong>{" "}
        Die vollständige, rechtlich geprüfte Datenschutzerklärung wird derzeit
        erstellt und vor dem öffentlichen Start ergänzt. Die folgenden Angaben
        beschreiben den aktuellen technischen Stand dieser Landingpage und sind
        keine abschließende Datenschutzerklärung.
      </PendingNotice>

      <Prose heading="Warteliste">
        <p>
          Wenn du dich für den Early Access einträgst, speichern wir:{" "}
          <strong>deine E-Mail-Adresse</strong>, optional{" "}
          <strong>deinen Vornamen</strong>, den{" "}
          <strong>Zeitpunkt der Anmeldung</strong>, die{" "}
          <strong>Sprache der Seite</strong> sowie{" "}
          <strong>Herkunftsinformationen</strong> (UTM-Parameter und
          verweisende Seite), damit wir wissen, über welchen Kanal du zu uns
          gefunden hast.
        </p>
        <p>
          Wir fragen dich <strong>nicht</strong> nach Diagnosen, Symptomen,
          Medikamenten, Therapieerfahrungen oder deinem Befinden. Solche Daten
          werden über diese Seite nicht erhoben und nicht gespeichert.
        </p>
        <p>
          Die Daten nutzen wir, um dich einzuladen, sobald ein Early-Access-Platz
          verfügbar ist. Der optionale Haken für Neuigkeiten ist davon getrennt,
          nie vorausgewählt und jederzeit widerrufbar.
        </p>
      </Prose>

      <Prose heading="Statistik">
        <p>
          Wir möchten verstehen, wie viele Menschen die Seite erreichen, woher
          sie kommen und an welcher Stelle sie abbrechen. Dafür nutzen wir
          PostHog — aber <strong>erst nach deiner Zustimmung</strong>. Ohne
          Zustimmung wird das Analyse-Werkzeug nicht geladen und es wird kein
          Ereignis übertragen.
        </p>
        <p>
          Auch mit Zustimmung sind Sitzungsaufzeichnung und automatisches
          Erfassen von Klicks und Eingaben abgeschaltet. Übertragen werden nur
          festgelegte Ereignisse zum Ablauf (zum Beispiel: Seite aufgerufen,
          Formular begonnen, Anmeldung erfolgreich) sowie die
          Herkunftsinformationen. <strong>Formularinhalte</strong> — also deine
          E-Mail-Adresse oder dein Name — werden{" "}
          <strong>nie an die Statistik übertragen</strong>.
        </p>
      </Prose>

      <Prose heading="Deine Entscheidung">
        <p>
          Du kannst der Statistik widersprechen, ohne dass die Seite dadurch
          eingeschränkt ist. Wenn du aus der Warteliste gelöscht werden möchtest,
          genügt eine Nachricht an uns — die Kontaktdaten stehen im{" "}
          <a href="/impressum">Impressum</a>.
        </p>
      </Prose>

      <PendingNotice>
        Noch zu ergänzen: verantwortliche Stelle, Rechtsgrundlagen,
        Speicherdauern, eingesetzte Auftragsverarbeiter samt Hosting-Standort
        sowie die vollständige Belehrung über deine Rechte.
      </PendingNotice>
    </PageShell>
  );
}
