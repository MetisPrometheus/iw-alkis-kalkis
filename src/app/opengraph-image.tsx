import { ImageResponse } from "next/og";
import { getProductsMeta } from "@/lib/products";

export const alt = "alkis kalkis — finn billigste promille på Polet";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const meta = getProductsMeta();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background:
            "linear-gradient(135deg, #fafaf7 0%, #f1efea 60%, #e9d8c6 100%)",
          color: "#161513",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "84px",
              height: "84px",
              borderRadius: "20px",
              background: "#161513",
              color: "#fafaf7",
              fontSize: "52px",
              fontWeight: 800,
              letterSpacing: "-3px",
            }}
          >
            a<span style={{ color: "#b3304f" }}>k</span>
          </div>
          <div
            style={{
              fontSize: "32px",
              fontWeight: 600,
              color: "#161513",
              opacity: 0.7,
            }}
          >
            alkis kalkis
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{
              fontSize: "92px",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-3px",
              maxWidth: "1000px",
            }}
          >
            Hva gir mest{" "}
            <span style={{ color: "#b3304f" }}>promille</span> per krone?
          </div>
          <div
            style={{
              fontSize: "34px",
              color: "#161513",
              opacity: 0.65,
              maxWidth: "900px",
            }}
          >
            {meta.count.toLocaleString("nb-NO")} produkter fra Vinmonopolet,
            sortert etter pris per liter ren alkohol.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            fontSize: "26px",
            color: "#161513",
            opacity: 0.6,
          }}
        >
          <span>🍻</span>
          <span>🍷</span>
          <span>🥃</span>
          <span>🍏</span>
          <span style={{ marginLeft: "auto", fontWeight: 600 }}>
            alkis-kalkis
          </span>
        </div>
      </div>
    ),
    { ...size },
  );
}
