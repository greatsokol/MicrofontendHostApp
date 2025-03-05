import {Inject, Injectable, OnDestroy} from "@angular/core";
import {AuthConfig, OAuthEvent, OAuthService} from "angular-oauth2-oidc";
import {AuthContext, ResolveType} from "./types/authcontext";
import {AppConfig} from "./types/appconfig";
import {Subscription} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private authContext: AuthContext | null = null;
  private events$: Subscription | null = null;

  constructor(private oAuthService: OAuthService, @Inject('appConfig') private readonly appConfig: AppConfig) {
    this.debug("Constructor host");

  }

  private initialize() {//resolve: ResolveType
    return new Promise<boolean>((resolve: ResolveType): void => {
      const authConfig: AuthConfig = {
        // Url of the Identity Provider
        issuer: this.appConfig.keycloak.issuer,
        // URL of the SPA to redirect the user to after login
        redirectUri: location.origin,
        // The SPA's id. The SPA is registerd with this id at the auth-server
        // clientId: 'server.code',
        clientId: this.appConfig.keycloak.clientId,
        // Just needed if your auth server demands a secret. In general, this
        // is a sign that the auth server is not configured with SPAs in mind
        // and it might not enforce further best practices vital for security
        // such applications.
        // dummyClientSecret: 'secret',
        responseType: 'code',
        // set the scope for the permissions the client should request
        // The first four are defined by OIDC.
        // Important: Request offline_access to get a refresh token
        // The api scope is a usecase specific one
        scope: 'openid', //profile email offline_access api
        showDebugInformation: true,
        clockSkewInSec: 10
      };
      console.debug("Initialization", authConfig);
      this.oAuthService.configure(authConfig);
      this.events$ = this.oAuthService.events.pipe().subscribe((event: OAuthEvent): void => {
        this.debug(event);
        //if (event.type in ["token_refresh_error", "silent_refresh_error", "invalid_nonce_in_state"]) {
        //console.debug("RELOADING FROM EVENT");
        //this.logout();
        //}
      });

      this.oAuthService.loadDiscoveryDocument().then((): void => {
          this.debug("Initialization success");
          resolve(true);
        },
        (reason: any): void => {
          console.debug("Initialization error", reason);
          resolve(false);
        }
      ).catch((e: any): void => {
        console.debug("Initialization exception", e);
        resolve(false);
      });
    });
  }

  ngOnDestroy(): void {
    this.debug("ON DESTROY");
    this.events$?.unsubscribe();
  }

  public logout = (resolve: ResolveType | undefined): void => {
    this.debug("Logging out");
    this.resetAuthContext();
    this.events$?.unsubscribe();
    this.oAuthService.revokeTokenAndLogout()?.then(_ => {
        this.debug("Logged out successfully");
        if (resolve) resolve(false);
      }, (reason: any) => {
        this.debug("Logging out error", reason);
        if (resolve) resolve(false);
      }
    ).catch((e: any) => {
      this.debug("Logging out exception", e);
      if (resolve) resolve(false);
    });
  }

  private refreshTokenIsValid(): boolean {
    try {
      const rawRefreshToken = this.oAuthService.getRefreshToken();
      if (!rawRefreshToken) return false;
      const refreshToken: any = JSON.parse(atob(rawRefreshToken.split('.')[1]));
      const type: string = refreshToken.typ;
      if (type.toLowerCase() != "refresh") {
        this.debug("Unsupported type of refresh_token", type);
        return false;
      }
      //const iat: number = refreshToken.iat * 1000;
      const expiration: number = refreshToken.exp * 1000;
      //const expiration: number = exp - (exp - iat) * .3; // 70% of expiration interval
      const now: number = Date.now();
      this.debug(now, expiration, expiration < now ? "refresh_token expired" : "refresh_token not expired");
      return expiration > now;
    } catch (e) {
      this.debug("Can validate refresh_token", e);
      return false;
    }
  }

  private refreshToken(resolve: ResolveType): void {
    this.resetAuthContext();
    try {
      console.log("Refreshing access_token", this.oAuthService.tokenEndpoint);
      this.oAuthService.refreshToken().then(_ => {
        this.debug("Refreshed access_token successfully");
        resolve(true);
      }, (reason: any) => {
        this.debug("Refresh access_token error reason", reason);
        this.logout(resolve);
      })
    } catch (e) {
      this.debug("Refresh access_token exception:", e);
      this.logout(resolve);
    }
  }

  private login(resolve: ResolveType): void {
    this.resetAuthContext();
    this.debug("Logging in");
    this.oAuthService.tryLogin().then((loggedIn: boolean) => {
      if (loggedIn) {
        this.debug("initLoginFlow");
        this.oAuthService.initLoginFlow();
      } else {
        this.debug("Not logged in");
      }
      resolve(false); // not logged in, just redirected to keycloak
    }, (error: any) => {
      this.debug("Login error", error);
      resolve(false);
      location.reload();
    }).catch((e: any) => {
      this.debug("Login exception", e);
      resolve(false);
      location.reload();
    });
  }

  private _isAuthenticated(resolve: ResolveType) {
    const notLoggedIn: boolean = !!this.oAuthService.getAccessToken();
    if (!notLoggedIn) {
      this.login(resolve);
    } else if (this.oAuthService.hasValidAccessToken()) {
      this.debug("access_token is valid");
      resolve(true);
    } else if (this.refreshTokenIsValid()) {
      this.refreshToken(resolve);
    } else {
      this.logout(resolve);
    }
  }

  public isAuthenticated = (): Promise<boolean> => {
    return new Promise<boolean>((resolve: ResolveType): void => {
      const notInitialized: boolean = !this.oAuthService.tokenEndpoint;
      if (notInitialized) {
        this.initialize().then(success => {
          if (success) {
            this._isAuthenticated(resolve);
          } else {
            resolve(false);
          }
        });
      } else {
        this._isAuthenticated(resolve);
      }
    });
  }

  private getAccessTokenClaims(): null | any {
    const rawAccessToken: string = this.oAuthService.getAccessToken();
    if (!rawAccessToken) {
      return null;
    }
    return JSON.parse(atob(rawAccessToken.split('.')[1]));
  }

  private getAllRolesWithGroups(accessToken: any): string[] {
    if (!accessToken) return [];
    const groups: string[] | null = accessToken ? accessToken['groups'] : null; // "groups" claim is a PSB specific
    const roles: string[] = accessToken["realm_access"]["roles"];
    return groups ? roles.concat(groups) : roles;
  }

  public getAuthContext = (): null | AuthContext => {
    if (this.authContext) return this.authContext;

    const accessToken = this.getAccessTokenClaims();
    if (!accessToken) {
      //this.debug("getAuthContext: NO VALID ACCESS TOKEN");
      return null;
    }
    this.debug("getAuthContext token:", accessToken);

    const preferred_username: string = accessToken ? accessToken["preferred_username"] : "";
    const userRoles: string[] = this.getAllRolesWithGroups(accessToken);
    const sessionId: string = accessToken ? accessToken["sid"] : "";

    this.authContext = {
      userName: preferred_username,
      userRoles: userRoles,
      logoutFunc: this.logout,
      sessionId: sessionId
    };

    return this.authContext;
  }

  private resetAuthContext(): void {
    this.authContext = null;
  }

  private debug(...args: any[]): void {
    console.debug("AuthService:", ...args);
  }
}
