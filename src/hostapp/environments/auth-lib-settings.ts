import {AuthLibOidcSettings} from "../services/auth-service";

export const authLibSettings: AuthLibOidcSettings = {
  keycloak: {
    issuer: "https://keycloak.local/realms/APIM",
    clientId: "microfrontends_client"
  }
}
