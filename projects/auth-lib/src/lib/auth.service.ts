import {Inject, inject, Injectable} from "@angular/core";
import {KeycloakEventType, KeycloakService} from "keycloak-angular";
import {AuthContext} from "./types/authcontext";
import {KeycloakProfile} from "keycloak-js";
import {initializeKeycloak} from "./keycloak";
import {AppConfig} from "./types/appconfig";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private keycloakService = inject(KeycloakService);
  private keycloakProfile: KeycloakProfile | null = null;
  private authContext: AuthContext | null = null;
  private sessionId: string | undefined = undefined;

  private clearContext = () => {
    this.keycloakProfile = null;
    this.authContext = null;
  }

  private updateProfile(callback: (() => void) | null) {
    this.keycloakService.loadUserProfile()
      .then(profile => {
        this.keycloakProfile = profile;
        this.sessionId = this.keycloakService.getKeycloakInstance().sessionId;
        console.log("Successfully updated keycloak user profile and sessionId", this.keycloakProfile, this.sessionId);
        if (callback) {
          console.log("KeycloakEventType.OnReady subscription callback");
          callback();
        }
      })
      .catch(err => {
        this.clearContext();
        console.error("Failed to load keycloak user profile", err);
      });
  }

  public subscribeOnKeycloakReady(callback: () => void) {
    this.keycloakService.keycloakEvents$.subscribe(event => {
        if (event.type === KeycloakEventType.OnReady) {
          this.updateProfile(callback);
        }
      }
    );
  }

  public unsubscribe() {
    try {
      this.keycloakService.keycloakEvents$.unsubscribe();
    } catch (e) {
      console.log(e);
    }
  }

  constructor(@Inject('appConfig') private readonly appConfig: AppConfig) {
    //console.log("AUTH SERVICE CSTR", appConfig);
    initializeKeycloak(this.keycloakService, this.appConfig);

    this.keycloakService.keycloakEvents$.subscribe(event => {
      if (event.type === KeycloakEventType.OnAuthError) {
        //console.log("KeycloakEventType.OnAuthError", event.args);
      } else if (event.type === KeycloakEventType.OnAuthLogout) {
        //console.log("KeycloakEventType.OnAuthLogout", event.args);
        this.clearContext();
      } else if (event.type === KeycloakEventType.OnAuthRefreshError) {
        //console.log("KeycloakEventType.OnAuthRefreshError", event.args);
      } else if (event.type === KeycloakEventType.OnAuthSuccess) {
        //console.log("KeycloakEventType.OnAuthSuccess", event.args);
      } else if (event.type === KeycloakEventType.OnActionUpdate) {
        //console.log("KeycloakEventType.OnActionUpdate", event.args);
      } else if (event.type === KeycloakEventType.OnAuthRefreshSuccess) {
        //console.log("KeycloakEventType.OnAuthRefreshSuccess", event.args);
      } else if (event.type === KeycloakEventType.OnReady) {
        //console.log("KeycloakEventType.OnReady", event.args);
        this.updateProfile(null);
      } else if (event.type === KeycloakEventType.OnTokenExpired) {
        //console.log("KeycloakEventType.OnTokenExpired", event.args);
        this.keycloakService
          .updateToken(20)
          .then(res => {
            if (res) {
              console.log("Successfully updated token");
            } else {
              console.error("Failed to update keycloak token. No further information.");
            }
          })
          .catch(err => {
            this.clearContext();
            console.error("Failed to update keycloak token", err);
          });
      }
    })

  }

  public logout = (): void => {
    this.keycloakProfile = null;
    this.keycloakService.logout().then(() => console.warn("Logged out"));
  }

  public isLoggedIn(): boolean {
    //console.log("isLoggedIn:", this.keycloakProfile != null, "username:", this.keycloakService.getUsername() );
    return this.keycloakProfile != null;
  }

  private getAllRolesWithGroups = () => {
    const token = this.keycloakService.getKeycloakInstance().tokenParsed;
    const groups = token ? token['groups'] : null; // "groups" claim is a PSB specific
    const roles = this.keycloakService.getUserRoles()
    return groups ? roles.concat(groups) : roles;
  }

  public getAuthContext = (): null | AuthContext => {
    if (!this.isLoggedIn()) {
      this.authContext = null;
      return null;
    }
    if (this.authContext != null) {
      return this.authContext;
    }

    this.authContext = {
      userName: this.keycloakService.getUsername(),
      userRoles: this.getAllRolesWithGroups(),
      logoutFunc: this.logout,
      profileId: this.keycloakProfile?.id,
      sessionId: this.sessionId
    };
    return this.authContext;
  }
}

// export const AuthServiceProvider: Provider = {
//   provide: APP_INITIALIZER,
//   useFactory: (keycloak: KeycloakService) => () => {
//     console.log("authServiceProvider FACTORY");
//     initializeKeycloak(keycloak, null);
//   },
//   multi: true,
//   deps: [KeycloakService]
// }


