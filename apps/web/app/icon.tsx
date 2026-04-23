import { ImageResponse } from "next/og";

export const size = {
  width: 64,
  height: 64,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #08111d 0%, #0f2440 55%, #0cc6f2 100%)",
          color: "white",
          fontSize: 30,
          fontWeight: 700,
          borderRadius: 14,
          letterSpacing: "-0.04em",
        }}
      >
        SP
      </div>
    ),
    {
      ...size,
    },
  );
}
