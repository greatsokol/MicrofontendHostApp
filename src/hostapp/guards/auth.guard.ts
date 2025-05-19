import {inject} from "@angular/core";
import {CanActivateFn} from "@angular/router";
import {AuthService} from "../services/auth-service";


export const canActivate = (allowedRolesGroupName: string): CanActivateFn => {
  return () => {
    return new Promise<boolean>(resolve => {
      console.debug(`Host: Can activate for "${allowedRolesGroupName}"?`);
      inject(AuthService).isAuthenticated(allowedRolesGroupName, false).then(value => resolve(value)
      );
    });
  };
}


