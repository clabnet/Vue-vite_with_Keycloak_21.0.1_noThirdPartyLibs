import { createApp } from "vue";
import App from "./App.vue";
import Keycloak from "keycloak-js";
import axios from "axios";
import VueAxios from "vue-axios";
import { h, reactive } from "vue";

//==== Keycloack ====================== 
let initOptions = {
  url: 'http://localhost:8080/', realm: 'demo', clientId: 'app', onLoad: 'login-required'
}

let keycloak = new Keycloak(initOptions);
const props = reactive({ keycloak: keycloak })

keycloak
  .init({ onLoad: initOptions.onLoad })
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
        .updateToken(10)
        .then((refreshed) => {
          if (refreshed) {
            console.log("Token refreshed", refreshed);
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
    }, 10000);
  })
  .catch((err) => {
    console.error("Authentication Failed", err);
  });
//==== Keycloack ====================== 

