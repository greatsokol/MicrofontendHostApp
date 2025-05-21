import {inject, Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, forkJoin, map, Observable, tap} from "rxjs";
import {AuthLibAllowedRoles, AuthLibOidcSettings} from "../auth-service";
import {ExtendedManifestType} from "../../types/extended-manifest.type";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  #http: HttpClient = inject(HttpClient);
  #roles?: AuthLibAllowedRoles;
  #oidcsettings?: AuthLibOidcSettings;
  #manifest?: ExtendedManifestType;
  initializationComplete = new BehaviorSubject<boolean>(false);

  #loadAssets<T>(path: string): Observable<T> {
    return this.#http.get<T>(path);
  }

  loadRoles() {
    return this.#loadAssets<AuthLibAllowedRoles>('assets/auth-lib-allowed-roles.json').pipe(
      map(roles => this.#roles = roles)
    )
  }

  loadKCSettings() {
    return this.#loadAssets<AuthLibOidcSettings>('assets/auth-lib-settings.json').pipe(
      map(settings => this.#oidcsettings = settings)
    )
  }

  loadMainfest() {
    return this.#loadAssets<ExtendedManifestType>('assets/mf.manifest.json').pipe(
      map(manifest => this.#manifest = manifest)
    )
  }

  loadSettings() {
    return forkJoin([this.loadMainfest(), this.loadRoles(), this.loadKCSettings()])
      .pipe(
        tap(_ => {
          this.initializationComplete.next(true);
        })
      );
  }

  getRoles(): AuthLibAllowedRoles {
    if (!this.#roles) new Error('SettingsService: no roles loaded');
    return this.#roles!;
  }

  getManifest(): ExtendedManifestType {
    if (!this.#manifest) new Error('SettingsService: no manifest loaded');
    return this.#manifest!;
  }

  getOidcSettings(): AuthLibOidcSettings {
    if (!this.#oidcsettings) new Error('SettingsService: no OIDC settings loaded');
    return this.#oidcsettings!;
  }


}
