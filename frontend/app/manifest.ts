import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Regjistri Personal",
    short_name: "Regjistri",
    description: "Ditari yt i strukturuar — vetëm për ty.",
    start_url: "/panel",
    scope: "/",
    display: "standalone",
    background_color: "#121316",
    theme_color: "#121316",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Shto shpenzim",
        short_name: "+ Shpenzim",
        url: "/panel/shpenzime/shpejt",
        description: "Shto shpejt një shpenzim",
      },
    ],
  };
}
