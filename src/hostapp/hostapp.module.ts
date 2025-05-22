import {NgModule} from "@angular/core";

import {HostAppComponent} from "./hostappcomponent/hostapp.component";
import {RouterModule} from "@angular/router";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {AUTH_LIB_ALLOWED_ROLES_TOKEN, AUTH_LIB_SETTINGS_TOKEN, AuthModule} from "./services/auth-service";
import {authLibAllowedRoles, authLibSettings, manifest} from "./environments";
import {MANIFEST_TOKEN} from "./tokens/manifest.token";


@NgModule({
  imports: [
    AuthModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
    //HttpClientModule,
    RouterModule.forRoot([]),  //{bindToComponentInputs: true}
  ],
  providers: [
    {provide: MANIFEST_TOKEN, useValue: manifest},
    {provide: AUTH_LIB_SETTINGS_TOKEN, useValue: authLibSettings},
    {provide: AUTH_LIB_ALLOWED_ROLES_TOKEN, useValue: authLibAllowedRoles},
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
