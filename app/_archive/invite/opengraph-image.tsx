import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BLUE = "#073c8d";
const BG = "#e8e5e4";

export default async function OpengraphImage() {
  const fontData = await readFile(path.join(process.cwd(), "public/fonts/vanguardcf-heavyoblique.otf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: BG,
          backgroundImage: `radial-gradient(circle at 20% 20%, ${BLUE}14 0%, transparent 50%), radial-gradient(circle at 80% 80%, ${BLUE}14 0%, transparent 50%)`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 28px",
            borderRadius: 999,
            border: `2px solid ${BLUE}33`,
            color: BLUE,
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: 6,
            textTransform: "uppercase",
            marginBottom: 32,
          }}
        >
          Exclusive Invitation
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: BLUE,
            fontSize: 116,
            letterSpacing: -3,
            lineHeight: 0.95,
            textTransform: "uppercase",
            textAlign: "center",
            fontFamily: "Vanguard CF",
          }}
        >
          <div style={{ display: "flex" }}>You Have Been</div>
          <div style={{ display: "flex" }}>Selected</div>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 36,
            color: `${BLUE}bb`,
            fontSize: 32,
            fontWeight: 700,
          }}
        >
          Blueprint Workshop · August 27
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Vanguard CF",
          data: fontData,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
