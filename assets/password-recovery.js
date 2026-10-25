/* Analyse des retours Supabase Auth pour que l'application affiche toujours
   la boîte de réinitialisation, y compris les liens expirés ou incomplets. */
(function (root) {
  "use strict";

  function parseLocation(locationLike) {
    const location = locationLike || {};
    const query = new URLSearchParams(location.search || "");
    const fragment = new URLSearchParams(String(location.hash || "").replace(/^#/, ""));
    const get = key => fragment.get(key) || query.get(key) || "";
    const type = get("type").toLowerCase();
    const accessToken = get("access_token");
    const tokenHash = get("token_hash");
    const code = get("code");
    const errorCode = get("error_code");
    const description = get("error_description") || get("error");
    const recoverySignal = type === "recovery" || (!type && Boolean(
      accessToken || tokenHash || code || errorCode || description
    ));

    return { isRecovery: recoverySignal, type, accessToken, tokenHash, code, errorCode, description };
  }

  root.STI_PASSWORD_RECOVERY = { parseLocation };
})(typeof window !== "undefined" ? window : globalThis);
