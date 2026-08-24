import type { Metadata } from "next";

import { PageShell, Prose } from "@/components/layout/page-shell";
import { ACUTE_HELP_RESOURCES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Akute Hilfe",
  description:
    "Evi ist kein Krisendienst. Hier findest du Hinweise, wohin du dich wenden kannst, wenn du akut Unterstützung brauchst.",
  robots: { index: true, follow: true },
};

/**
 * Crisis guidance.
 *
 * The specific services in ACUTE_HELP_RESOURCES are intentionally empty until
 * a human has verified them: a wrong number on this page is worse than no
 * number. The guidance below is deliberately generic — it names types of help
 * that exist everywhere rather than inventing a hotline.
 */
export default function AkuteHilfePage() {
  return (
    <PageShell
      title="Akute Hilfe"
      intro="Evi ist kein Krisendienst und keine Notfallversorgung. Wenn du gerade dringend Unterstützung brauchst, findest du sie hier schneller als bei uns."
    >
      <div className="rounded-2xl border border-periwinkle-200 bg-periwinkle-50 p-6">
        <h2 className="text-lg font-bold text-text-primary">
          Wenn es gerade dringend ist
        </h2>
        <p className="mt-3 leading-relaxed text-text-primary">
          Wenn du in unmittelbarer Gefahr bist oder daran denkst, dir das Leben
          zu nehmen: Wende dich bitte sofort an den Notruf oder an die nächste
          Notaufnahme. Dort ist rund um die Uhr jemand erreichbar.
        </p>
        <p className="mt-3 leading-relaxed text-text-tertiary">
          Du musst das nicht allein aushalten und nicht erst begründen, ob es
          „schlimm genug“ ist.
        </p>
      </div>

      {ACUTE_HELP_RESOURCES.length > 0 ? (
        <Prose heading="Anlaufstellen">
          <ul className="space-y-4">
            {ACUTE_HELP_RESOURCES.map((resource) => (
              <li key={resource.name} className="ml-0 list-none">
                <div className="rounded-2xl border border-border bg-surface p-5">
                  <h3 className="font-bold text-text-primary">{resource.name}</h3>
                  <p className="mt-1 text-[0.95rem]">{resource.description}</p>
                  {resource.availability ? (
                    <p className="mt-1 text-sm text-text-secondary">
                      {resource.availability}
                    </p>
                  ) : null}
                  {resource.phone ? (
                    <a
                      href={`tel:${resource.phone.replace(/\s/g, "")}`}
                      className="mt-3 inline-flex min-h-11 items-center font-semibold text-text-primary"
                    >
                      {resource.phone}
                    </a>
                  ) : null}
                  {resource.href ? (
                    <a
                      href={resource.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block"
                    >
                      Zur Website
                    </a>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </Prose>
      ) : null}

      <Prose heading="Wenn es nicht akut, aber belastend ist">
        <p>
          Auch unterhalb einer Krise gibt es Stellen, die weiterhelfen können.
          Welche davon passt, hängt von deiner Situation ab:
        </p>
        <ul className="space-y-1.5">
          <li>
            <strong>Hausärztliche Praxis</strong> — oft der einfachste erste
            Schritt, auch um weiterverwiesen zu werden.
          </li>
          <li>
            <strong>Psychotherapeutische Praxen</strong> — für eine fachliche
            Einschätzung und mögliche Behandlung.
          </li>
          <li>
            <strong>Beratungsstellen vor Ort</strong> — viele Städte,
            Hochschulen und Träger bieten kostenlose Beratung an.
          </li>
          <li>
            <strong>Menschen in deinem Umfeld</strong> — jemandem zu sagen, wie
            es dir geht, ist bereits ein Schritt.
          </li>
        </ul>
      </Prose>

      <Prose heading="Was Evi hier nicht leisten kann">
        <p>
          Evi ist als digitaler Begleiter für Orientierung gedacht — nicht als
          Notfallhilfe. Evi ersetzt keine Psychotherapie und keine medizinische
          Behandlung, stellt keine Diagnose und kann nicht garantieren, dass
          eine akute Situation erkannt wird. Es gibt auch keine Zusage, dass ein
          Mensch mitliest oder sich bei dir meldet.
        </p>
      </Prose>
    </PageShell>
  );
}
