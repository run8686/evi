import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "Evi — Verstehen, was gerade in dir los ist. Jetzt für Early Access vormerken.";

/**
 * Share preview.
 *
 * Uses the real mascot artwork (unaltered) on the brand's dark surface, so a
 * shared link is recognisably Evi. ImageResponse supports flexbox only — no
 * grid — and the fonts available to it are the built-in ones, which cover
 * German diacritics.
 */
export default async function Image() {
  const mascot = await readFile(
    join(process.cwd(), "public", "assets", "logo-mascot-og.png"),
  );
  const mascotSrc = `data:image/png;base64,${mascot.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          backgroundColor: "#1c0d20",
          overflow: "hidden",
        }}
      >
        {/* Brand aura */}
        <div
          style={{
            position: "absolute",
            top: -260,
            right: -160,
            width: 780,
            height: 780,
            borderRadius: 9999,
            background:
              "linear-gradient(135deg, #e94fb0 0%, #ff7a45 100%)",
            opacity: 0.32,
            filter: "blur(120px)",
          }}
        />

        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            padding: "72px 76px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", width: 660 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontSize: 21,
                fontWeight: 700,
                letterSpacing: 3.4,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.62)",
              }}
            >
              <div
                style={{
                  width: 13,
                  height: 13,
                  borderRadius: 9999,
                  background:
                    "linear-gradient(135deg, #e94fb0 0%, #ff7a45 100%)",
                }}
              />
              Evi Early Access
            </div>

            <div
              style={{
                marginTop: 30,
                fontSize: 66,
                fontWeight: 800,
                lineHeight: 1.08,
                letterSpacing: -2.2,
                color: "#ffffff",
              }}
            >
              Verstehen, was gerade in dir los ist.
            </div>

            <div
              style={{
                marginTop: 26,
                fontSize: 27,
                lineHeight: 1.45,
                color: "rgba(255,255,255,0.7)",
              }}
            >
              Gedanken sortieren, Belastungen besser verstehen und einen
              passenden nächsten Schritt finden.
            </div>
          </div>

          <img src={mascotSrc} alt="" width={310} height={260} />
        </div>
      </div>
    ),
    size,
  );
}
