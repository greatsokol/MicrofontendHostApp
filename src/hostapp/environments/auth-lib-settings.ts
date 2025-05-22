import {AuthLibAllowedRoles, AuthLibOidcSettings} from "../services/auth-service";

export const authLibSettings: AuthLibOidcSettings = {
  keycloak: {
    issuer: "https://keycloak.local/realms/APIM",
    clientId: "microfrontends_client"
  }
}

export const authLibAllowedRoles: AuthLibAllowedRoles = {
  mf_kcusers: {
    userRoles: ["user"],
    adminRoles: ["admin"]
  },
  mf_auth_service: {
    adminRoles: ['admin'],
    userRoles: ['user']
  }
}
