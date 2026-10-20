/** De testapp NL Wallet MOZa (Android), als release bij moza-wallet-testomgeving. */
export const GET = () => {
  const adres = process.env.NL_WALLET_APP_URL;
  if (!adres)
    return new Response(
      "NL Wallet MOZa is in deze omgeving niet te downloaden.",
      { status: 404 },
    );
  return Response.redirect(adres, 302);
};
