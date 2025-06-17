import {Component, inject, OnDestroy, OnInit} from "@angular/core";

import {Router, Routes} from "@angular/router";
import {AuthService} from "../services/auth-service";
import {canActivate} from "../guards/auth.guard";
import {loadRemoteModule} from "@angular-architects/module-federation";
import {ExtendedManifestItem} from "../types/extended-manifest.type";
import {MANIFEST_TOKEN} from "../tokens/manifest.token";
import {Subscription, takeWhile, tap, timer} from "rxjs";


@Component({
  selector: "host-app-root",
  templateUrl: "./hostapp.component.html",
  styleUrls: ["./hostapp.component.scss"],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class HostAppComponent implements OnInit, OnDestroy {
  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);
  protected manifest = inject(MANIFEST_TOKEN);
  protected userName: string | null = null;
  protected authenticated = false;
  routerInitialized = false;
  sub?: Subscription;

  ngOnInit() {
    this.router.resetConfig(this.generateRoutes());
    this.sub = timer(1000, 5000).pipe(
      tap(_ => {
        this.authenticated = this.authService.isAuthenticated();
        if (this.authenticated) {
          if (!this.routerInitialized) {
            this.router.resetConfig(this.generateRoutes());
            this.routerInitialized = true;
          }
          this.userName = this.authService.getUserName();
        } else {
          this.authService.logout();
        }
      }),
      takeWhile(_ => this.authenticated)
    ).subscribe();
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
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
      path: '**', redirectTo: '', pathMatch: 'full'
    });

    return routes;
  }

  authenticate() {
    this.authService.authenticate().then(result => {
      this.authenticated = result;
    })
  }
}
