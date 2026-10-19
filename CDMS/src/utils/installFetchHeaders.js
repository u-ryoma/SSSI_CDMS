const API = import.meta.env.VITE_API_URL;

export default function installFetchHeaders() {
  if (!API || window.__fetchHeadersInstalled) return;
  window.__fetchHeadersInstalled = true;

  const originalFetch = window.fetch.bind(window);

  window.fetch = (input, init = {}) => {
    const url = typeof input === "string" ? input : input.url;

    if (url && url.startsWith(API)) {
      const headers = new Headers(
        init.headers || (typeof input !== "string" ? input.headers : undefined),
      );
      const username = sessionStorage.getItem("username");
      const name = sessionStorage.getItem("name");
      const role = sessionStorage.getItem("role");
      const token = sessionStorage.getItem("token");

      if (username && !headers.has("x-username")) {
        headers.set("x-username", username);
      }
      if (name && !headers.has("x-name")) {
        headers.set("x-name", encodeURIComponent(name));
      }
      if (role && !headers.has("x-user-role")) {
        headers.set("x-user-role", role);
      }
      if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      init = { ...init, headers };
    }
    return originalFetch(input, init);
  };
}
