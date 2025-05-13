import {AuthLibOidcSettings} from "oidc-auth-lib";

export const authLibSettings: AuthLibOidcSettings = {
  keycloak: {
    issuer: "https://keycloak.local/realms/APIM",
    clientId: "microfrontends_client"
  }
}
