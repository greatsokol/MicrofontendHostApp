import {KeycloakBearerInterceptor, KeycloakService} from "keycloak-angular";
import {AppConfig} from "./types/appconfig";
import {HTTP_INTERCEPTORS, HttpClient} from "@angular/common/http";
import {APP_INITIALIZER, Inject, Provider} from "@angular/core";

export const initializeKeycloak = (keycloak: KeycloakService, config: AppConfig | null) => {
  keycloak.init({
    config: {
      url: config ? config.keycloak.url : "https://keycloak.local",
      realm: config ? config.keycloak.realm : "master",
      clientId: config ? config.keycloak.clientId : "microfrontends_client",
    },
    loadUserProfileAtStartUp: true,
    initOptions: {
      //onLoad: 'check-sso',
      onLoad: 'login-required',
      //silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
      //checkLoginIframe: false,
      //redirectUri: config ? config.keycloak.redirectUri : "http://localhost:4200",
    },
    enableBearerInterceptor: true,
    // Prefix for the Bearer token
    bearerPrefix: 'Bearer',
  }).then(result => {
    if(result) {
      console.log("Successfully initialized keycloak service");
    } else {
      console.error("Failed to initialize keycloak service. No further information");
    }
  })
    .catch(err => console.error("Failed to initialize keycloak service", err));
}

// const loadConfigThenInitialiazeKeycloak = (keycloak: KeycloakService, http: HttpClient) => async () => {
//   http.get<AppConfig>("/assets/config.ts").subscribe(
//     (response: AppConfig) => {
//       //console.log(response);
//       initializeKeycloak(keycloak, response);
//     },
//     (err) => {
//       console.error(err);
//       initializeKeycloak(keycloak, null);
//     }
//   );
// }

// Provider for Keycloak Bearer Interceptor
export const KeycloakBearerInterceptorProvider: Provider = {
  provide: HTTP_INTERCEPTORS,
  useClass: KeycloakBearerInterceptor,
  multi: true
};

// Provider for Keycloak Initialization
// export const KeycloakInitializerProvider: Provider = {
//   provide: APP_INITIALIZER,
//   useFactory: loadConfigThenInitialiazeKeycloak,
//   multi: true,
//   deps: [KeycloakService, HttpClient]
// };
