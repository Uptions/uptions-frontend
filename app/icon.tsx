import { ImageResponse } from "next/og"

export const size = { width: 512, height: 512 }
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#0B78FF" }}>
      <div style={{ width: 270, height: 320, border: "22px solid white", borderRadius: "160px 160px 160px 30px", transform: "rotate(-45deg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 82, height: 82, borderRadius: "50%", background: "white" }} />
      </div>
    </div>,
    { ...size },
  )
}
