import {AuthLibAllowedRoles, AuthLibOidcSettings} from "oidc-auth-lib";

export const AUTH_LIB_SETTINGS: AuthLibOidcSettings = {
  keycloak: {
    issuer: "https://keycloak.local/realms/APIM",
    clientId: "microfrontends_client"
  }
}

export const AUTH_LIB_ALLOWED_ROLES: AuthLibAllowedRoles = {
  kcusers: {
    userRoles: [],
    adminRoles: ['admin']
  },
  auth_finstar: {
    adminRoles: ['admin'],
    userRoles: ['user']
  }
}
