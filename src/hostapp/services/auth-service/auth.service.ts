import {inject, Injectable, OnDestroy} from "@angular/core";
import {AuthConfig, OAuthEvent, OAuthService} from "angular-oauth2-oidc";
import {AuthLibAllowedRolesItem, AuthLibOidcSettings, ResolveType} from "./types";
import {Subscription} from "rxjs";
import {SettingsService} from "../settings-service";

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnDestroy {
  private events$: Subscription | null = null;
  private settingsService = inject(SettingsService);
  private oAuthService = inject(OAuthService)
  private accessTokenClaims: any | null = null;
  private userRoles: string[] | null = null;
  private userName: string | null = null;
  private sessionId: string | null = null;

  constructor() {
    this.debug("Constructor AuthService");
    this.settingsService.initializationComplete.subscribe(
      result => {
        if (result) {
          if (sessionStorage.getItem('nonce')) this.authenticate();
        }
      }
    )
  }

  private getRoles(rolesGroup: string): AuthLibAllowedRolesItem {
    return this.settingsService.getRoles()[rolesGroup];
  }

  private getOidcSettings(): AuthLibOidcSettings {
    return this.settingsService.getOidcSettings();
  }

  private initialize() {//resolve: ResolveType
    return new Promise<boolean>((resolve: ResolveType): void => {
      const authConfig: AuthConfig = {
        // Url of the Identity Provider
        issuer: this.getOidcSettings().keycloak.issuer,
        // URL of the SPA to redirect the user to after login
        redirectUri: location.origin + location.pathname,
        // The SPA's id. The SPA is registerd with this id at the auth-server
        // clientId: 'server.code',
        clientId: this.getOidcSettings().keycloak.clientId,
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
        scope: 'api', //profile email offline_access api
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

  public logout = (resolve?: ResolveType): void => {
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
      this.debug("Can't validate refresh_token", e);
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
      //resolve(false); // not logged in, just redirected to keycloak
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

  private getRolesIntersection(userRoles: string[], allowedRoles: string[]): string[] {
    const allowedGroupsSet = new Set(allowedRoles);
    return userRoles.filter((element: string) => allowedGroupsSet.has(element));
  }

  private isUserHasAllowedRoles = (allowedRoles: string[]) => {
    const tokenRoles = this.getUserRoles();
    if (!tokenRoles || !tokenRoles.length) {
      //console.debug('No roles available in access token!');
      return false;
    }

    const intersection = this.getRolesIntersection(tokenRoles, allowedRoles);
    //console.debug(`Roles (${tokenRoles}) intersection with allowed roles ([${allowedRoles}]): ${intersection}`);
    return intersection.length > 0;
  }

  private isAdminAccessAllowed(rolesGroupName: string) {
    const allowedRoles = this.getRoles(rolesGroupName);
    if (!allowedRoles.adminRoles.length) {
      console.error('Empty allowed admin roles!');
      return false;
    }
    return this.isUserHasAllowedRoles(allowedRoles.adminRoles);
  }

  public isAccessAllowed(rolesGroupName: string) {
    const allowedRoles = this.getRoles(rolesGroupName);
    if (!allowedRoles) {
      console.error(`No roles for ${rolesGroupName}. Check manifest!`);
      return false;
    }
    if (!allowedRoles.userRoles.length && !allowedRoles.adminRoles.length) {
      console.error('Empty allowed user and admin roles!');
      return false;
    }
    const allRoles = allowedRoles.userRoles.concat(allowedRoles.adminRoles);
    return this.isUserHasAllowedRoles(allRoles);
  }

  private _authenticate(resolve: ResolveType, rolesGroupName: string | null = null, allowedAdminOnly: boolean | null = null) {
    const notLoggedIn: boolean = !!this.oAuthService.getAccessToken();
    if (!notLoggedIn) {
      this.login(resolve);
    } else if (this.oAuthService.hasValidAccessToken()) {
      this.debug("access_token is valid");
      if (allowedAdminOnly === null || rolesGroupName === null) {
        // проверка ролей не требуется
        resolve(true);
      } else {
        // требуется проверка ролей
        resolve(allowedAdminOnly
          ? this.isAdminAccessAllowed(rolesGroupName)
          : this.isAccessAllowed(rolesGroupName));
      }
    } else if (this.refreshTokenIsValid()) {
      this.refreshToken(resolve);
    } else {
      this.logout(resolve);
    }
  }

  public authenticate = (rolesGroupName: string | null = null, allowedAdminOnly: boolean | null = null): Promise<boolean> => {
    return new Promise<boolean>((resolve: ResolveType): void => {
      const notInitialized: boolean = !this.oAuthService.tokenEndpoint;
      if (notInitialized) {
        this.initialize().then(success => {
          if (success) {
            this._authenticate(resolve, rolesGroupName, allowedAdminOnly);
          } else {
            resolve(false);
          }
        });
      } else {
        this._authenticate(resolve, rolesGroupName, allowedAdminOnly);
      }
    });
  }

  public isAuthenticated() {
    return this.oAuthService.hasValidAccessToken() || this.refreshTokenIsValid();
  }

  private getAccessTokenClaims(): null | any {
    const rawAccessToken: string = this.oAuthService.getAccessToken();
    if (!rawAccessToken) {
      //this.debug("getAccessTokenClaims: NO VALID ACCESS TOKEN");
      return null;
    }
    return JSON.parse(atob(rawAccessToken.split('.')[1]));
  }

  private getAllRolesWithGroups(accessToken: any): string[] {
    if (!accessToken) return [];
    const groups: string[] | null = accessToken ? accessToken['groups'] : null; // "groups" claim is a PSB specific
    return groups ? groups : [];
  }

  private resetAuthContext(): void {
    this.accessTokenClaims = null;
    this.userRoles = null;
    this.userName = null;
    this.sessionId = null;
    // localStorage.removeItem('PKCE_verifier');
    // localStorage.removeItem('nonce');
    // localStorage.removeItem('session_state');
  }

  public getIssuerUri(): string {
    return this.getOidcSettings().keycloak.issuer;
  }

  public getUserRoles(): string[] | null {
    if (this.userRoles) return this.userRoles;
    if (!this.accessTokenClaims) {
      this.accessTokenClaims = this.getAccessTokenClaims();
      if (!this.accessTokenClaims) return null;
    }
    this.userRoles = this.getAllRolesWithGroups(this.accessTokenClaims);
    return this.userRoles;
  }

  public getUserName(): string | null {
    if (this.userName) return this.userName;
    if (!this.accessTokenClaims) {
      this.accessTokenClaims = this.getAccessTokenClaims();
      if (!this.accessTokenClaims) return null;
    }
    this.userName = this.accessTokenClaims["preferred_username"];
    return this.userName;
  }

  public getSessionId(): string | null {
    if (this.sessionId) return this.sessionId;
    if (!this.accessTokenClaims) {
      this.accessTokenClaims = this.getAccessTokenClaims();
      if (!this.accessTokenClaims) return null;
    }
    this.sessionId = this.accessTokenClaims["sid"];
    return this.sessionId;
  }

  private debug(...args: any[]): void {
    console.debug("AuthService:", ...args);
  }
}
