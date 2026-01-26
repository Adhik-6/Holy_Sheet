/*! coi-serviceworker v0.1.7 - Guido Zuidhof, licensed under MIT */
let coepCredentialless = false;
if (typeof window === 'undefined') {
  self.addEventListener("install", () => self.skipWaiting());
  self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

  self.addEventListener("message", (ev) => {
    if (!ev.data) {
      return;
    } else if (ev.data.type === "deregister") {
      self.registration.unregister().then(() => {
        return self.clients.matchAll();
      }).then(clients => {
        clients.forEach((client) => client.navigate(client.url));
      });
    } else if (ev.data.type === "coepCredentialless") {
      coepCredentialless = ev.data.value;
    }
  });

  self.addEventListener("fetch", function (event) {
    const r = event.request;
    if (r.cache === "only-if-cached" && r.mode !== "same-origin") {
      return;
    }

    const request = (coepCredentialless && r.mode === "no-cors")
      ? new Request(r, {
        credentials: "omit",
      })
      : r;
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 0) {
            return response;
          }

          const newHeaders = new Headers(response.headers);
          newHeaders.set("Cross-Origin-Embedder-Policy",
            coepCredentialless ? "credentialless" : "require-corp"
          );
          if (!coepCredentialless) {
            newHeaders.set("Cross-Origin-Opener-Policy", "same-origin");
          }

          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders,
          });
        })
        .catch((e) => console.error(e))
    );
  });
} else {
  (() => {
    const reloadedBySelf = window.sessionStorage.getItem("coiReloadedBySelf");
    window.sessionStorage.removeItem("coiReloadedBySelf");
    const coepNew = window.sessionStorage.getItem("coiCoepCredentialless");
    window.sessionStorage.removeItem("coiCoepCredentialless");

    const coepCredentialless = (coepNew === "true");

    if (window.navigator.serviceWorker && window.location.hostname !== 'localhost') {
        // Skip for localhost to avoid reload loops in some dev environments
        // BUT for Capacitor on 192.168.x.x, we usually NEED this.
    }

    if (window.navigator.serviceWorker) {
        window.navigator.serviceWorker.register(window.document.currentScript.src).then(
        (registration) => {
            console.log("COI Service Worker registered");

            registration.addEventListener("updatefound", () => {
            console.log("Reloading because COI Service Worker updated");
            window.location.reload();
            });

            if (registration.active && !window.navigator.serviceWorker.controller) {
            console.log("Reloading because COI Service Worker active");
            window.location.reload();
            }
        },
        (err) => {
            console.error("COI Service Worker failed to register: ", err);
        }
        );
    }
  })();
}