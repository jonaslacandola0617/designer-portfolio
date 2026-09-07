import { ImageResponse } from "next/og";

export const alt =
  "Jonas Lacandola — Independent Visual Designer portfolio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#F2F0EA",
          color: "#111111",
          padding: "58px 64px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 58,
            left: 64,
            width: 70,
            height: 70,
            border: "2px solid #111111",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "serif",
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-1px",
          }}
        >
          JL
        </div>

        <div
          style={{
            position: "absolute",
            top: 66,
            right: 72,
            width: 34,
            height: 34,
            border: "2px solid #2438D6",
            borderRadius: "50%",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 82,
            right: 58,
            width: 62,
            height: 2,
            background: "#2438D6",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 52,
            right: 88,
            width: 2,
            height: 62,
            background: "#2438D6",
          }}
        />

        <div
          style={{
            alignSelf: "flex-end",
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            borderTop: "2px solid #111111",
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontFamily: "serif",
                fontSize: 78,
                lineHeight: 0.95,
                fontWeight: 700,
                letterSpacing: "-3px",
              }}
            >
              Jonas Lacandola
            </div>
            <div
              style={{
                marginTop: 20,
                fontFamily: "monospace",
                fontSize: 22,
                letterSpacing: "2px",
                textTransform: "uppercase",
                color: "#6E6B65",
              }}
            >
              Independent Visual Designer
            </div>
          </div>

          <div
            style={{
              fontFamily: "monospace",
              fontSize: 18,
              lineHeight: 1.5,
              letterSpacing: "1px",
              textAlign: "right",
              textTransform: "uppercase",
              color: "#6E6B65",
            }}
          >
            <div>Pampanga / Philippines</div>
            <div>design.jonasl.online</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
