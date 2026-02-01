import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Trade Log",
    short_name: "TradeLog",
    description: "로컬 퍼스트 매매일지",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        src: "/screenshots/desktop-1.png",
        sizes: "1668x1164",
        type: "image/png",
        form_factor: "wide",
        label: "대시보드",
      },
      {
        src: "/screenshots/desktop-2.png",
        sizes: "1668x1164",
        type: "image/png",
        form_factor: "wide",
        label: "매매 목록",
      },
      {
        src: "/screenshots/desktop-3.png",
        sizes: "1668x1164",
        type: "image/png",
        form_factor: "wide",
        label: "매매 등록",
      },
    ],
  };
}
