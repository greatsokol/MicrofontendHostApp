import {NgModule} from "@angular/core";

import {HostAppComponent} from "./hostappcomponent/hostapp.component";
import {RouterModule} from "@angular/router";
import {APP_ROUTES} from "./hostapp.routes";
import {AUTH_LIB_ALLOWED_ROLES_TOKEN, AUTH_LIB_SETTINGS_TOKEN, AuthModule, AuthService} from "oidc-auth-lib";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {authLibSettings} from "./environments/auth-lib-settings";
import {authLibAllowedRoles} from "./environments/auth-lib-allowed-roles";

@NgModule({
  imports: [
    AuthModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    RouterModule.forRoot(APP_ROUTES) //{bindToComponentInputs: true}
  ],
  providers: [
    AuthService,
    {
      provide: AUTH_LIB_SETTINGS_TOKEN, useValue: authLibSettings
    },
    {
      provide: AUTH_LIB_ALLOWED_ROLES_TOKEN, useValue: authLibAllowedRoles
    }
  ],
  declarations: [
    HostAppComponent
  ],
  bootstrap: [
    HostAppComponent
  ]
})
export class HostAppModule {
}
