import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone",

  // De inlogflow uit moza-poc staat als losse HTML in public/inloggen, met de
  // eigen CSS en bestanden van moza-poc en DigiD in public/inloggen/assets.
  async rewrites() {
    return [
      {
        source: "/inloggen/zakelijk",
        destination: "/inloggen/zakelijk.html",
      },
      {
        source: "/inloggen/nl-wallet/terug",
        destination: "/inloggen/nl-wallet-terug.html",
      },
      {
        source: "/inloggen/nl-wallet/app",
        destination: "/inloggen/nl-wallet-app.html",
      },
      {
        source: "/inloggen/digid/zakelijk",
        destination: "/inloggen/digid-zakelijk.html",
      },
      {
        source: "/inloggen/digid-app/zakelijk",
        destination: "/inloggen/digid-app-zakelijk.html",
      },
    ];
  },

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
