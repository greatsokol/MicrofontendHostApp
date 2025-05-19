import {InjectionToken} from "@angular/core";
import {AuthLibOidcSettings} from "../types";
import {authLibSettings} from "../../../environments/auth-lib-settings";

export const AUTH_LIB_SETTINGS_TOKEN = new InjectionToken<AuthLibOidcSettings>("AUTH_LIB_SETTING_TOKEN", {
    factory: () => authLibSettings,
    providedIn: null
});
