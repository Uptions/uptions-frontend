import { ImageResponse } from "next/og"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"
export const alt = "Uptions — Deliver More, Stress Less"

export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", padding: "58px 72px", color: "#003B8E", background: "linear-gradient(135deg, #F7FCFF 0%, #DDF1FF 58%, #B4E0FF 100%)", position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", fontSize: 42, fontWeight: 800 }}>
        <span style={{ width: 48, height: 48, borderRadius: 24, background: "#0B78FF", display: "flex", alignItems: "center", justifyContent: "center", marginRight: 16 }}>
          <span style={{ width: 16, height: 16, borderRadius: 8, background: "white" }} />
        </span>
        Uptions
      </div>
      <div style={{ display: "flex", flexDirection: "column", marginTop: 108, fontSize: 92, lineHeight: 1.05, fontWeight: 800, letterSpacing: -4 }}>
        <span>Deliver <span style={{ color: "#0B78FF" }}>More,</span></span>
        <span>Stress <span style={{ color: "#0B78FF" }}>Less.</span></span>
      </div>
      <div style={{ marginTop: 34, width: 760, fontSize: 29, lineHeight: 1.35, color: "#174B7A" }}>Compare trusted delivery providers and book the right option for every package.</div>
      <div style={{ position: "absolute", right: 78, bottom: 76, display: "flex", alignItems: "flex-end", gap: 18 }}>
        <span style={{ width: 150, height: 62, borderRadius: 28, background: "#003B8E", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ width: 42, height: 42, borderRadius: 21, background: "#0B78FF", border: "8px solid white" }} />
        </span>
        <span style={{ width: 120, height: 120, borderRadius: 14, background: "#0B78FF", border: "8px solid #003B8E" }} />
      </div>
    </div>,
    { ...size },
  )
}
