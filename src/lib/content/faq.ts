/**
 * The FAQ content, grouped.
 *
 * Wording rule for this file: present tense, no "kommt später", no "im Aufbau".
 * Where something is genuinely still being decided, the answer says what the
 * principle is instead of promising a date — a question with no honest answer
 * yet does not get a made-up one.
 */

export type FaqItem = { question: string; answer: string };
export type FaqGroup = { title: string; items: readonly FaqItem[] };

export const FAQ_GROUPS: readonly FaqGroup[] = [
  {
    title: "Über evi",
    items: [
      {
        question: "Was genau ist evi?",
        answer:
          "evi ist ein persönlicher digitaler Begleiter für alles, was dich innerlich beschäftigt. Du erzählst, was los ist. evi hilft dir, es zu verstehen, zu sortieren und einen nächsten Schritt zu finden. Der Zugang startet in kleinen Wellen.",
      },
      {
        question: "Für welche Themen kann ich evi nutzen?",
        answer:
          "Für Stress, Überforderung, Einsamkeit, Konflikte, Entscheidungen, Selbstverständnis, Sorge um andere — und für alles, worüber du gerade mit keinem Menschen sprechen möchtest.",
      },
      {
        question: "Muss es mir psychisch schlecht gehen?",
        answer:
          "Nein. evi ist ausdrücklich auch für Menschen gedacht, die belastet sind, ohne eine psychische Erkrankung zu haben. Du brauchst keinen Anlass und keine Diagnose.",
      },
      {
        question: "Kann ich auch über Beziehungen oder andere Menschen sprechen?",
        answer:
          "Ja. Das ist eine der beiden Hauptperspektiven: Wenn dich jemand beschäftigt, der dir wichtig ist, hilft dir evi, deine Beobachtungen, deine eigene Reaktion und verantwortbare nächste Schritte zu sortieren.",
      },
      {
        question: "Ist evi ein KI-Therapeut?",
        answer:
          "Nein. evi ist kein Therapeut, kein Arzt und kein Krisendienst. Es geht um Verstehen, Sortieren und Orientierung — nicht um Behandlung.",
      },
      {
        question: "Was unterscheidet evi von ChatGPT oder anderen KI-Chatbots?",
        answer:
          "Vor allem der Produktansatz: ein enger, verantworteter Einsatzbereich statt Allzweck-Assistent; Gespräch und Nachfragen statt schneller Antwortlisten; fachlich mitentwickelte Grenzen; und die Haltung, dass Menschen wichtiger bleiben als das Produkt. Dazu kommt: evi grenzt sich auch von Mood-Trackern und Meditations-Apps ab — es sammelt keine Punktzahlen über dich, sondern redet mit dir.",
      },
    ],
  },
  {
    title: "Nutzung und Grenzen",
    items: [
      {
        question: "Kann evi Diagnosen stellen?",
        answer:
          "Nein. evi stellt keine Diagnosen — weder über dich noch über andere Menschen.",
      },
      {
        question: "Kann evi Therapie ersetzen?",
        answer:
          "Nein. evi ersetzt keine Psychotherapie, keine Diagnose und keine ärztliche Behandlung.",
      },
      {
        question: "Was passiert, wenn meine Situation ernster ist?",
        answer:
          "Dann benennt evi das und unterstützt beim Übergang zu passender Hilfe, statt das Gespräch selbst weiterzuführen. Das Safety-Framework mit klaren Eskalationsstufen entsteht gemeinsam mit Psycholog:innen.",
      },
      {
        question: "Ist evi für akute Krisen gedacht?",
        answer:
          "Nein. In einer akuten Notlage wende dich bitte an den Notruf 112 oder die Telefonseelsorge unter 0800 111 0 111 beziehungsweise 0800 111 0 222.",
      },
      {
        question:
          "Kann evi mir sagen, welche psychische Erkrankung eine andere Person hat?",
        answer:
          "Nein, und das ist eine bewusste Entscheidung. evi beurteilt keine Menschen, die nicht am Gespräch beteiligt sind. Es hilft dir stattdessen, deine eigene Sicht und deine Handlungsmöglichkeiten zu sortieren.",
      },
    ],
  },
  {
    title: "Persönlicher Kontext",
    items: [
      {
        question: "Erinnert sich evi an frühere Gespräche?",
        answer:
          "Ja. evi hat ein langfristiges Memory, damit du nicht jedes Mal von vorn anfangen musst.",
      },
      {
        question: "Kann ich kontrollieren, was evi über mich speichert?",
        answer:
          "Ja. Dein persönlicher Kontext ist für dich einsehbar und steuerbar — er gehört dir, nicht dem Produkt.",
      },
      {
        question: "Kann ich Erinnerungen löschen?",
        answer:
          "Ja. Du kannst Inhalte löschen, einzeln oder ganz.",
      },
      {
        question: "Gibt es Gespräche ohne persönliches Memory?",
        answer:
          "Ja. Du kannst ein Gespräch führen, das nichts in deinem persönlichen Kontext hinterlässt.",
      },
    ],
  },
  {
    title: "Daten",
    items: [
      {
        question: "Was passiert mit meinen Gesprächen?",
        answer:
          "Grundsatz: persönliche Gespräche sind kein Geschäftsmodell. Sie werden nicht verkauft, nicht für Werbeprofile genutzt und nicht zum Training allgemeiner KI-Modelle monetarisiert. Diese Grundsätze legen wir jetzt fest, während evi entsteht — nicht erst, wenn Millionen Gespräche gelaufen sind.",
      },
      {
        question: "Werden meine Daten verkauft?",
        answer:
          "Nein. Der Verkauf persönlicher Gesprächs- oder Gesundheitsdaten ist ausgeschlossen.",
      },
      {
        question:
          "Werden meine Gespräche zum Training allgemeiner KI-Modelle verwendet?",
        answer:
          "Nein. Konkrete technische Zusicherungen veröffentlichen wir erst, wenn wir sie auch belegen können.",
      },
      {
        question: "Kann eine Institution meine Gespräche sehen?",
        answer:
          "Nein. Wer evi bezahlt, besitzt nicht deinen persönlichen Kontext. Institutionen erhalten keinen Zugriff auf einzelne Chats oder individuelle Inhalte.",
      },
    ],
  },
  {
    title: "Kosten",
    items: [
      {
        question: "Was kostet evi?",
        answer:
          "Für Endnutzer bleibt evi dauerhaft kostenlos. Das ist unsere langfristige Produktentscheidung.",
      },
      {
        question: "Warum zahlen Nutzer nichts?",
        answer:
          "Weil Zugang zu Unterstützung nicht am Geld hängen sollte — und weil wir nicht wollen, dass deine Daten die Gegenleistung sind. Wie wir uns finanzieren, kommunizieren wir, sobald es final entschieden ist.",
      },
    ],
  },
  {
    title: "Early Access",
    items: [
      {
        question: "Wer kann sich anmelden?",
        answer: "Erwachsene ab 18 Jahren.",
      },
      {
        question: "Wann bekomme ich Zugang?",
        answer:
          "Das können wir noch nicht zusagen. Der Zugang erfolgt schrittweise in kleinen Testwellen — wir melden uns, sobald du dran bist.",
      },
      {
        question: "Ist die Anmeldung kostenlos?",
        answer: "Ja. Die Anmeldung ist kostenlos und unverbindlich.",
      },
      {
        question: "Was passiert nach meiner Anmeldung?",
        answer:
          "Du bestätigst deine Adresse per Mail und landest auf der Early-Access-Liste. Danach passiert erst mal nichts: kein Newsletter, keine Erinnerungen. Wir schreiben dir, wenn eine Testwelle offen ist.",
      },
      {
        question: "Wie kann ich mich wieder austragen?",
        answer:
          "Über den Abmeldelink in jeder Mail, oder mit einer kurzen Nachricht an hello@evi-health.eu. Wir löschen deine Adresse dann vollständig.",
      },
    ],
  },
];
