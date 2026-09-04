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
          <strong>Herkunftsinformationen</strong> (UTM-Parameter und verweisende
          Seite), damit wir wissen, über welchen Kanal du zu uns gefunden hast.
        </p>
        <p>
          Wir fragen dich <strong>nicht</strong> nach Diagnosen, Symptomen,
          Medikamenten, Therapieerfahrungen oder deinem Befinden. Solche Daten
          werden über diese Seite nicht erhoben und nicht gespeichert.
        </p>
        <p>
          Die Daten nutzen wir, um dich einzuladen, sobald ein
          Early-Access-Platz verfügbar ist. Der optionale Haken für Neuigkeiten
          ist davon getrennt, nie vorausgewählt und jederzeit widerrufbar.
        </p>
      </Prose>

      <Prose heading="Bestätigung deiner Anmeldung">
        <p>
          Nach dem Absenden des Formulars stehst du noch nicht auf der Liste.
          Wir schicken dir zuerst eine E-Mail mit einem Bestätigungslink
          (Double-Opt-In). Erst wenn du dort auf den Button klickst, gilt die
          Anmeldung. So stellen wir sicher, dass die Adresse wirklich dir gehört
          — und dass niemand eine fremde Adresse auf eine Warteliste zum Thema
          psychische Gesundheit setzen kann.
        </p>
        <p>
          Für den Versand nutzen wir <strong>Resend</strong> (Resend, Inc., USA)
          als Auftragsverarbeiter. Dabei werden deine E-Mail-Adresse und der
          Inhalt dieser Nachricht in die <strong>USA</strong> übermittelt. Zu
          jeder Anmeldung speichern wir außerdem den Zeitpunkt, zu dem die
          Bestätigungsmail ausgestellt und zugestellt wurde, und den Zeitpunkt
          deiner Bestätigung — das ist der Nachweis deiner Einwilligung.
        </p>
        <p>
          Der Bestätigungslink enthält ein Zufallstoken. In unserer Datenbank
          liegt davon nur eine Prüfsumme, nicht das Token selbst. Der Link gilt{" "}
          <strong>sieben Tage</strong>.
        </p>
        <p>
          Unsere E-Mails enthalten oben unser Logo. Dieses Bild wird beim Öffnen
          von unserem Server nachgeladen; dabei werden{" "}
          <strong>Zeitpunkt und IP-Adresse</strong> deines Mailprogramms
          sichtbar. Wir werten das <strong>nicht</strong> aus und ordnen es
          keiner Anmeldung zu — die Bild-Adresse ist für alle Empfänger
          dieselbe. <strong>Zählpixel setzen wir nicht ein</strong>, und ob du
          eine Mail geöffnet hast, speichern wir nirgends. Je nach Einstellung
          lädt dein Mailprogramm Bilder automatisch, über einen Bild-Proxy oder
          erst nach deiner Freigabe.
        </p>
      </Prose>

      <Prose heading="Wie lange wir speichern">
        <p>
          Anmeldungen, die <strong>nicht bestätigt</strong> werden, löschen wir
          automatisch nach <strong>30 Tagen</strong> vollständig.
        </p>
        <p>
          Bestätigte Anmeldungen speichern wir, bis der Early Access
          abgeschlossen ist oder du dich abmeldest — je nachdem, was zuerst
          eintritt.
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
          eingeschränkt ist.
        </p>
        <p>
          Aus der Warteliste kommst du jederzeit wieder heraus:{" "}
          <strong>In jeder E-Mail von uns steht ein Abmeldelink.</strong> Ein
          Klick darauf löscht deine Adresse vollständig — wir behalten keine
          Restliste von Menschen, die nicht mehr angeschrieben werden möchten.
          Alternativ genügt eine Nachricht an uns; die Kontaktdaten stehen im{" "}
          <a href="/impressum">Impressum</a>.
        </p>
        <p>
          Wenn du gar nicht erst bestätigst, passiert ebenfalls nichts: Die
          Anfrage wird nach 30 Tagen automatisch gelöscht.
        </p>
      </Prose>

      <PendingNotice>
        Noch zu ergänzen: verantwortliche Stelle, Rechtsgrundlagen, die
        Rechtsgrundlage für die Übermittlung in die USA samt
        Auftragsverarbeitungsvertrag mit Resend, Hosting-Standort der Datenbank
        sowie die vollständige Belehrung über deine Rechte.
      </PendingNotice>
    </PageShell>
  );
}
