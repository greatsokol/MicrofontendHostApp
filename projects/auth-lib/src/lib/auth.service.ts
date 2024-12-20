import {Inject, inject, Injectable} from "@angular/core";
import {AuthConfig, OAuthService} from "angular-oauth2-oidc";
import {AuthContext} from "./types/authcontext";
import {AppConfig} from "./types/appconfig";
import {BehaviorSubject, Observable} from "rxjs";
import {filter} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private oAuthService = inject(OAuthService);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private isAuthenticated = this.isAuthenticatedSubject.asObservable();
  private authContext: AuthContext | null = null;

  constructor(@Inject('appConfig') private readonly appConfig: AppConfig) {
    this.initializeOAuth(this.oAuthService, this.appConfig);
  }

  public logout = (): void => {
    this.resetAuthContext();
    this.oAuthService.logOut();
  }

  public isLoggedIn(): boolean {
    return this.oAuthService.hasValidAccessToken();
  }

  public onLoggedIn(): Observable<boolean> {
    return this.isAuthenticated;
  }

  private getDecodedAccessToken = () => {
    const rawAccessToken = this.oAuthService.getAccessToken();
    if (!rawAccessToken) {
      return null;
    }
    return JSON.parse(atob(rawAccessToken.split('.')[1]));
  }

  private getAllRolesWithGroups = (accessToken: any) => {
    if (!accessToken) return [];
    const groups = accessToken ? accessToken['groups'] : null; // "groups" claim is a PSB specific
    const roles = accessToken["realm_access"]["roles"];
    return groups ? roles.concat(groups) : roles;
  }

  public getAuthContext = (): null | AuthContext => {
    if (this.authContext) return this.authContext;

    const accessToken = this.getDecodedAccessToken();
    if (!accessToken) {
      console.debug("getAuthContext: NO VALID ACCESS TOKEN")
      return null;
    }
    console.debug("getAuthContext token:", accessToken);

    const preferred_username: string = accessToken ? accessToken["preferred_username"] : "";
    const userRoles = this.getAllRolesWithGroups(accessToken);
    const sessionId = accessToken ? accessToken["sid"] : "";

    this.authContext = {
      userName: preferred_username,
      userRoles: userRoles,
      logoutFunc: this.logout,
      sessionId: sessionId
    };

    return this.authContext;
  }

  private resetAuthContext = () => {
    this.authContext = null;
  }

  private initializeOAuth = (oAuthService: OAuthService, appConfig: AppConfig) => {
    const authConfig: AuthConfig = {
      // Url of the Identity Provider
      issuer: appConfig.keycloak.issuer,
      // URL of the SPA to redirect the user to after login
      redirectUri: window.location.origin,// + '/index.html',
      // The SPA's id. The SPA is registerd with this id at the auth-server
      // clientId: 'server.code',
      clientId: appConfig.keycloak.clientId,
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
    };
    oAuthService.configure(authConfig);
    oAuthService.setupAutomaticSilentRefresh();
    oAuthService.events
      .pipe(filter((e: any) => e.type === "token_received"))
      .subscribe(() => {
        this.resetAuthContext();
        console.debug("token_received");
      });
    oAuthService.events
      .pipe(filter((e: any) => e.type === "token_error"))
      .subscribe(() => {
        this.resetAuthContext();
        console.debug("token_error");
        this.logout();
      });
    oAuthService.events
      .pipe(filter((e: any) => e.type === "token_expired"))
      .subscribe(() => {
        this.resetAuthContext();
        console.debug("token_expired");
      });
    oAuthService.events
      .subscribe(() => {
        this.isAuthenticatedSubject.next(this.oAuthService.hasValidAccessToken())
      });

    oAuthService.loadDiscoveryDocumentAndLogin().then(isLoggedIn => {
      this.resetAuthContext();
      if (isLoggedIn) {
        console.debug("Logged in successfully");
      } else {
        console.debug("Not logged in");
      }
    }, error => {
      console.debug({error});
      if (error.status === 400) {
        location.reload();
      }
    });
  }
}
