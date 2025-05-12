import {NgModule} from "@angular/core";

import {HostAppComponent} from "./hostappcomponent/hostapp.component";
import {RouterModule} from "@angular/router";
import {APP_ROUTES} from "./hostapp.routes";
import {AUTH_LIB_ALLOWED_ROLES, AUTH_LIB_SETTINGS} from "../config";
import {AUTH_LIB_ALLOWED_ROLES_TOKEN, AUTH_LIB_SETTINGS_TOKEN, AuthModule} from "oidc-auth-lib";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

@NgModule({
  imports: [
    AuthModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    RouterModule.forRoot(APP_ROUTES) //{bindToComponentInputs: true}
  ],
  providers: [
    {
      provide: AUTH_LIB_SETTINGS_TOKEN, useValue: AUTH_LIB_SETTINGS
    },
    {
      provide: AUTH_LIB_ALLOWED_ROLES_TOKEN, useValue: AUTH_LIB_ALLOWED_ROLES
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
