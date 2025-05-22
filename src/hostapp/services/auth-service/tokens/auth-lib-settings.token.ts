import {InjectionToken} from "@angular/core";
import {AuthLibOidcSettings} from "../types";

export const AUTH_LIB_SETTINGS_TOKEN = new InjectionToken<AuthLibOidcSettings>("AUTH_LIB_SETTING_TOKEN");
