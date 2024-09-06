import {Component, inject} from "@angular/core";

import {Router} from "@angular/router";
import {AuthService} from "@@auth-lib";


@Component({
  selector: "host-app-root",
  templateUrl: "./hostapp.component.html"
})
export class HostAppComponent {
  title = "HOST APPLICATION";

  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);

  constructor() {
    console.log("HOST", this.authService);
  }

}
