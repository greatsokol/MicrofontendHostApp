import {inject, Injectable, Injector} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {from, Observable, switchMap, tap} from 'rxjs';
import {AuthService} from "../auth.service";
import {AUTH_LIB_SETTINGS_TOKEN} from "../tokens";


@Injectable()
export class IsAuthenticatedInterceptor implements HttpInterceptor {
  #injector = inject(Injector);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {


    const url = request.url;
    if (url.startsWith('assets/')) {
      return next.handle(request);
    }

    const settings = this.#injector.get(AUTH_LIB_SETTINGS_TOKEN);

    const requestToOidcServer = url.startsWith(settings.keycloak.issuer);
    console.debug(`INTERCEPTOR request uri: ${url}, ` + `context: ${request.context}`);

    if (requestToOidcServer) {
      return next.handle(request);
    }

    const authService = this.#injector.get(AuthService);

    return from(authService.authenticate()).pipe(
      tap(result => console.debug('INTERCEPTOR isAuthenticated result', result)),
      switchMap(result => next.handle(request))
    );
  }
}
