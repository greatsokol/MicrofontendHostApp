import {ExtendedManifestType} from "../types/extended-manifest.type";

export const manifest:ExtendedManifestType = {
  mf_kcusers: {
    uri: "https://localhost:4202/kcusers/remoteEntry.js",
    route: "kcusers",
    exposedModule: "KcusersModule",
    module: "KcusersModule",
    roles: "mf_kcusers",
    name: "Управление пользователями"
  },

  mf_auth_service: {
    uri: "https://localhost:4203/remoteEntry.js",
    route: "auth-finstar",
    exposedModule: "AuthServiceModule",
    module: "AuthServiceModule",
    roles: "mf_auth_service",
    name: "Сервис авторизации"
  }
}
