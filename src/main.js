import { createApp } from "vue";
import App from "./App.vue";
import Keycloak from "keycloak-js";
import axios from "axios";
import VueAxios from "vue-axios";
import { h, reactive } from "vue";

//==== Keycloack ====================== 
// https://www.keycloak.org/docs/latest/securing_apps/index.html#_javascript_adapter
// let initOptions = {
//   // realm: "demo",
//   // url: "http://localhost:8080/",
//   // clientId: "app",
//   "onLoad": "login-required",
//   "clientId": "app",
//   "realm": "demo",
//   "auth-server-url": "http://localhost:8080/realms/demo/protocol/openid-connect/auth/",
//   // "ssl-required": "external",
//   // "resource": "app",
//   // "public-client": true,
//   // "confidential-port": 0
// };


let initOptions = {
  url: 'http://localhost:8080/realms/demo/protocol/openid-connect/auth/', realm: 'demo', clientId: 'app', onLoad: 'login-required'
}

let keycloak = new Keycloak(initOptions);
const props = reactive({ keycloak: keycloak })

keycloak
  .init({ onLoad: initOptions.onLoad })
  // .init()
  .then((auth) => {
    if (!auth) {
      window.location.reload();
    } else {
      console.log("Authenticated");

      const app = createApp({
        render: () => h(App, props)
      })

      app.use(VueAxios, axios);
      app.mount("#app");
    }

    //Token Refresh
    setInterval(() => {
      keycloak
        .updateToken(70)
        .then((refreshed) => {
          if (refreshed) {
            console.log("Token refreshed" + refreshed);
          } else {
            console.log(
              "Token not refreshed, valid for " +
              Math.round(
                keycloak.tokenParsed.exp +
                keycloak.timeSkew -
                new Date().getTime() / 1000
              ) +
              " seconds"
            );
          }
        })
        .catch(() => {
          console.log("Failed to refresh token");
        });
    }, 6000);
  })
  .catch((err) => {
    console.error("Authentication Failed", err);
  });
//==== Keycloack ====================== 

