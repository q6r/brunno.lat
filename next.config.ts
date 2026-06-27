import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lastfm.freetls.fastly.net", pathname: "/**" },
      { protocol: "https", hostname: "lastfm-img2.akamaized.net", pathname: "/**" },
      { protocol: "https", hostname: "cdn.discordapp.com", pathname: "/**" },
      { protocol: "https", hostname: "media.discordapp.net", pathname: "/**" },
      { protocol: "https", hostname: "i.scdn.co", pathname: "/**" },
      { protocol: "https", hostname: "api.cee.bio", pathname: "/**" },
      { protocol: "https", hostname: "cdn-images.dzcdn.net", pathname: "/**" },
      { protocol: "https", hostname: "e-cdns-images.dzcdn.net", pathname: "/**" },
      { protocol: "https", hostname: "flagcdn.com", pathname: "/**" },
    ],
  },
};

export default nextConfig;
