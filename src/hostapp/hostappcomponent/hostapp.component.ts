import {Component, inject, OnInit} from "@angular/core";

import {Router, Routes} from "@angular/router";
import {AuthService} from "../services/auth-service";
import {canActivate} from "../guards/auth.guard";
import {loadRemoteModule} from "@angular-architects/module-federation";
import {ExtendedManifestItem} from "../types/extended-manifest.type";
import {MANIFEST_TOKEN} from "../tokens/manifest.token";


@Component({
  selector: "host-app-root",
  templateUrl: "./hostapp.component.html",
  styleUrls: ["./hostapp.component.css"],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class HostAppComponent implements OnInit {
  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);
  protected manifest = inject(MANIFEST_TOKEN);
  protected showLogoff = false;
  protected userName: string | null = null;

  ngOnInit() {
    this.router.resetConfig(this.generateRoutes());

    if (this.authService.isAuthenticated()) {
      this.showLogoff = true;
      this.userName = this.authService.getUserName();
    }
  }

  generateRoutes() {
    const routes: Routes = [{
      path: "",
      loadComponent: () => import("../welcomepage/welcomepage.component").then(c => c.WelcomepageComponent)
    }];

    for (const [key, value] of Object.entries<ExtendedManifestItem>(this.manifest)) {
      if (this.authService.isAccessAllowed(value.roles)) {
        routes.push(
          {
            path: value.route,
            canActivate: [canActivate(value.roles)],
            title: value.name,
            runGuardsAndResolvers: 'always',
            loadChildren: () =>
              loadRemoteModule({
                type: 'manifest',
                remoteName: key,
                exposedModule: "./" + value.exposedModule
              }).then(m => m[value.module])
          }
        )
      }
    }

    routes.push({
      path: '**', redirectTo: '/', pathMatch: 'full'
    });

    return routes;
  }
}
