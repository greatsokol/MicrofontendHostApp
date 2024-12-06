import {Inject, inject, Injectable} from "@angular/core";
import {AuthConfig, OAuthErrorEvent, OAuthService, OAuthSuccessEvent} from "angular-oauth2-oidc";
import {AuthContext} from "./types/authcontext";
import {AppConfig} from "./types/appconfig";

type onReadyCallback = () => void;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private oAuthService = inject(OAuthService);
  private onReadyHandlersSet = new Set<onReadyCallback>();

  constructor(@Inject('appConfig') private readonly appConfig: AppConfig) {
    this.initializeOAuth(this.oAuthService, this.appConfig);
  }

  public subscribeOnKeycloakReady = (func: onReadyCallback) => {
    this.onReadyHandlersSet.add(func);
  }

  public logout = (): void => {
    this.oAuthService.revokeTokenAndLogout().then(() => {
    });
  }

  public isLoggedIn(): boolean {
    return this.oAuthService.hasValidAccessToken();
  }

  private getParsedAccessToken(): any {
    const token = this.oAuthService.getAccessToken();
    if (!token) return null;
    return JSON.parse(atob(token.split('.')[1]));
  }

  private getAllRolesWithGroups = (accessToken: any) => {
    if (!accessToken) return [];
    const groups = accessToken ? accessToken['groups'] : null; // "groups" claim is a PSB specific
    const roles = accessToken["realm_access"]["roles"];
    return groups ? roles.concat(groups) : roles;
  }

  public getAuthContext = (): null | AuthContext => {
    if (!this.isLoggedIn()) {
      return null;
    }

    const accessToken = this.getParsedAccessToken();
    const preferred_username: string = accessToken ? accessToken["preferred_username"] : "";
    const userRoles = this.getAllRolesWithGroups(accessToken);
    const sessionId = accessToken ? accessToken["sid"] : "";

    return {
      userName: preferred_username,
      userRoles: userRoles,
      logoutFunc: this.logout,
      //profileId: "",
      sessionId: sessionId
    };
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
      //showDebugInformation: true,
    };

    oAuthService.configure(authConfig);
    oAuthService.setupAutomaticSilentRefresh();
    oAuthService.events.subscribe((event) => {
      if (event instanceof OAuthSuccessEvent && event.type == "token_received") {
        this.onReadyHandlersSet.forEach(callbackFunc => {
          try {
            callbackFunc()
          } catch (err) {
            console.error(err);
          }
        });
      } else if (event instanceof OAuthErrorEvent) {
        this.logout();
      }
    });
    oAuthService.loadDiscoveryDocumentAndLogin().then(r => {
    });
  }
}




