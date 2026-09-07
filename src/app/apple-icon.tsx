import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const alt = "JL — Jonas Lacandola";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F2F0EA",
          color: "#111111",
          position: "relative",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 16,
            border: "4px solid #111111",
          }}
        />
        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: "-4px",
            lineHeight: 1,
          }}
        >
          JL
        </div>
        <div
          style={{
            position: "absolute",
            right: 31,
            top: 31,
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: "#2438D6",
          }}
        />
      </div>
    ),
    size,
  );
}
