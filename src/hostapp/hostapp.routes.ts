import {loadRemoteModule} from "@angular-architects/module-federation";
import {Routes} from "@angular/router";
import {canActivate} from "./auth.guard";

export const APP_ROUTES: Routes = [
  {
    path: "kcusers",
    loadChildren: () =>
      loadRemoteModule({
        type: "manifest",
        remoteName: "mf_kcusers",
        exposedModule: "./KCUsersModule"
      }).then(m => m.KcusersModule)
  },
  {
    path: "example",
    loadChildren: () => loadRemoteModule({
        type: "manifest",
        remoteName: "mf_example",
        exposedModule: "./ExampleModule"
      }).then(m => m.ExposingModule)
  },
  {
    path: "",
    redirectTo: "example",
    pathMatch: "full",
  }
];
