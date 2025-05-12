import {loadRemoteModule} from "@angular-architects/module-federation";
import {Routes} from "@angular/router";
import {canActivate} from "./guards/auth.guard";

export const APP_ROUTES: Routes = [
  {
    path: "kcusers",
    canActivate: [canActivate('kcusers')],
    runGuardsAndResolvers: 'always',
    loadChildren: () =>
      loadRemoteModule({
        type: "manifest",
        remoteName: "mf_kcusers",
        exposedModule: "./KCUsersModule"
      }).then(m => m.KcusersModule)
  },
  {
    path: "auth-finstar",
    canActivate: [canActivate('auth_finstar')],
    runGuardsAndResolvers: 'always',
    loadChildren: () =>
      loadRemoteModule({
        type: "manifest",
        remoteName: "mf_finstar_auth",
        exposedModule: "./FinstarAuthServiceModule"
      }).then(m => m.FinstarAuthServiceModule)
  },
  // {
  //   path: "example",
  //   loadChildren: () => loadRemoteModule({
  //     type: "manifest",
  //     remoteName: "mf_example",
  //     exposedModule: "./ExampleModule"
  //   }).then(m => m.ExposingModule)
  // },
  {
    path: "",
    redirectTo: "kcusers",
    pathMatch: "full",
  }
];
