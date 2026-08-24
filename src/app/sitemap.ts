import type { MetadataRoute } from "next";

import { SITE } from "@/lib/constants";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: SITE.url,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE.url}/akute-hilfe`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
