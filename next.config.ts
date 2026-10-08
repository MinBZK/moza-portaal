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
      {
        source: "/aanvragen",
        destination: "/lopendezaken",
        permanent: true,
      },
      {
        source: "/medewerkers",
        destination: "/personeel",
        permanent: true,
      },
      {
        source: "/omgevingsberichten",
        destination: "/buurtberichten",
        permanent: true,
      },
      {
        source: "/ondernemingsgegevens",
        destination: "/bedrijfsgegevens",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
