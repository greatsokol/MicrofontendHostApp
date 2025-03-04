import {Component, inject} from "@angular/core";

import {Router} from "@angular/router";
import {AuthService} from "@@auth-lib";


@Component({
  selector: "host-app-root",
  templateUrl: "./hostapp.component.html",
  styleUrls: ["./hostapp.component.css"]
})
export class HostAppComponent {
  title = "HOST APPLICATION";

  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);

  constructor() {
  }

}
