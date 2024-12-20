import {Inject, inject, Injectable} from "@angular/core";
import {AuthConfig, OAuthErrorEvent, OAuthService} from "angular-oauth2-oidc";
import {AuthContext} from "./types/authcontext";
import {AppConfig} from "./types/appconfig";

type onReadyCallback = () => void;
type onReadyCallbackAndCount = {
  func: onReadyCallback;
  once?: boolean;
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private oAuthService = inject(OAuthService);
  private onReadyHandlersSet = new Set<onReadyCallbackAndCount>();
  private loggedIn: boolean = false;

  constructor(@Inject('appConfig') private readonly appConfig: AppConfig) {
    this.initializeOAuth(this.oAuthService, this.appConfig);
  }

  public subscribeOnKeycloakReady = (func: onReadyCallback) => {
    this.onReadyHandlersSet.add({func});
  }

  public subscribeOnKeycloakReadyOnce = (func: onReadyCallback) => {
    this.onReadyHandlersSet.add({func, once: true});
  }

  public logout = (): void => {
    this.oAuthService.logOut();
    this.loggedIn = false;
  }

  public isLoggedIn(): boolean {
    return this.loggedIn;//this.oAuthService.hasValidAccessToken();
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

  private callSubscribers = () => {
    const countBefore = this.onReadyHandlersSet.size;
    this.onReadyHandlersSet.forEach(callbackFuncAndCount => {
      try {
        callbackFuncAndCount.func();
      } catch (err) {
        console.error("Callback error: ", err);
      }
      if (callbackFuncAndCount.once) {
        this.onReadyHandlersSet.delete(callbackFuncAndCount);
      }
    });
    console.log(`AuthService subscribers count ${countBefore} -> ${this.onReadyHandlersSet.size}`);
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
    oAuthService.events.subscribe((event) => {
      // if (event instanceof OAuthSuccessEvent && event.type == "token_received") {
      //   this.callSubscribers();
      // } else
      if (event instanceof OAuthErrorEvent) {
        this.logout();
      }
    });
    oAuthService.loadDiscoveryDocumentAndLogin().then(() => {
      console.log("Logged in successfully");
      this.loggedIn = true;
      this.callSubscribers();
    });
  }
}
