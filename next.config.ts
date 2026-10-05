import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",

  async redirects() {
    return [
      {
        source: "/contactgegevens",
        destination: "/contactgegevens/prive",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
