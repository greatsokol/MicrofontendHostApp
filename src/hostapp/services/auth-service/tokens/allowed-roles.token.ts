import {InjectionToken} from "@angular/core";
import {AuthLibAllowedRoles} from "../types";
import {authLibAllowedRoles} from "../../../environments/auth-lib-allowed-roles";

export const AUTH_LIB_ALLOWED_ROLES_TOKEN = new InjectionToken<AuthLibAllowedRoles>("AUTH_LIB_ALLOWED_ROLES_TOKEN", {
  factory: () => authLibAllowedRoles,
  providedIn: null
});
