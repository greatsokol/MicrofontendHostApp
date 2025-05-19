import {Component, inject} from "@angular/core";

import {Router} from "@angular/router";
import {AuthService} from "../services/auth-service";


@Component({
  selector: "host-app-root",
  templateUrl: "./hostapp.component.html",
  styleUrls: ["./hostapp.component.css"],
  //changeDetection: ChangeDetectionStrategy.OnPush
})
export class HostAppComponent {
  protected readonly authService = inject(AuthService);
  protected readonly router = inject(Router);

  constructor() {
  }

  isAccessAllowed(allowedRolesGroupName: string) {
    return this.authService.isAccessAllowed(allowedRolesGroupName);
  }
}
