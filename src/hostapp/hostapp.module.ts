import {NgModule} from "@angular/core";

import {HostAppComponent} from "./hostappcomponent/hostapp.component";
import {RouterModule} from "@angular/router";
import {APP_ROUTES} from "./hostapp.routes";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {OAuthModule} from "angular-oauth2-oidc";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {IsAuthenticatedInterceptor} from "./services/auth-service/interceptors";
import {AuthService} from "./services/auth-service";

@NgModule({
  imports: [
    BrowserAnimationsModule,
    MatSnackBarModule,
    OAuthModule.forRoot({
        resourceServer: {
          allowedUrls: ["http"],
          sendAccessToken: true
        }
      }
    ),
    HttpClientModule,
    RouterModule.forRoot(APP_ROUTES) //{bindToComponentInputs: true}
  ],
  providers: [
    AuthService,
    {
      provide: HTTP_INTERCEPTORS, useClass: IsAuthenticatedInterceptor, multi: true
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
