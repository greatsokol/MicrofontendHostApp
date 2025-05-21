import {Component, inject} from "@angular/core";

import {Router, Routes} from "@angular/router";
import {AuthService} from "../services/auth-service";
import {SettingsService} from "../services/settings-service";
import {canActivate} from "../guards/auth.guard";
import {loadRemoteModule} from "@angular-architects/module-federation";
import {ExtendedManifestItem} from "../types/extended-manifest.type";


@Component({
  selector: "host-app-root",
  templateUrl: "./hostapp.component.html",
  styleUrls: ["./hostapp.component.css"],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class HostAppComponent {
  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);
  protected manifest = inject(SettingsService).getManifest();
  protected initializationComplete = inject(SettingsService).initializationComplete;
  protected initCompleted = false;

  constructor() {
    this.initializationComplete.subscribe(
      completed => {
        this.initCompleted = completed;
      }
    );

    this.router.resetConfig(this.generateRoutes());
  }

  generateRoutes() {
    const routes: Routes = [{
      path: "",
      loadComponent: () => import("../welcomepage/welcomepage.component").then(c => c.WelcomepageComponent)
    }];
    for (const [key, value] of Object.entries<ExtendedManifestItem>(this.manifest)) {
      routes.push(
        {
          path: value.route,
          canActivate: [canActivate(value.roles)],
          runGuardsAndResolvers: 'always',
          loadChildren: () =>
            loadRemoteModule({
              type: 'manifest',
              remoteName: key,
              exposedModule: "./" + value.module
            }).then(m => m[value.module])
        }
      )
    }
    return routes;
  }

  protected readonly Object = Object;

  isAccessAllowed(roles: any) {
    return this.authService.isAccessAllowed(roles);
  }
}
