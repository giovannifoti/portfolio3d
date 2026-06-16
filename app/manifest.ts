import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Catalogo Stampa 3D",
    short_name: "3D Catalog",
    description: "Portfolio e catalogo per prodotti stampati in 3D con viewer .3mf.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f7f8",
    theme_color: "#111111",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
