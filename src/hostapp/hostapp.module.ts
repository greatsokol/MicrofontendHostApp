import {APP_INITIALIZER, NgModule} from "@angular/core";

import {HostAppComponent} from "./hostappcomponent/hostapp.component";
import {RouterModule} from "@angular/router";
import {MatSnackBarModule} from "@angular/material/snack-bar";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {AuthModule} from "./services/auth-service";
import {SettingsService} from "./services/settings-service";

function appLoadFactory(settingsService: SettingsService) {
  return () => settingsService.loadSettings();
}


@NgModule({
  imports: [
    AuthModule.forRoot(),
    BrowserAnimationsModule,
    MatSnackBarModule,
    //HttpClientModule,
    RouterModule.forRoot([]),  //{bindToComponentInputs: true}
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: appLoadFactory,
      deps: [SettingsService],
      multi: true
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
