import {inject, Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {from, Observable, switchMap, tap} from 'rxjs';
import {AuthService} from "../auth.service";


@Injectable()
export class IsAuthenticatedInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);

  constructor() {
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const requestToOidcServer = request.url.startsWith(this.authService.getIssuerUri());
    console.debug(`INTERCEPTOR request uri: ${request.url}, ` +
      `request to OIDC: ${requestToOidcServer}, ` +
      `roles: ${this.authService.getUserRoles()}, ` +
      `context: ${request.context}`);

    if (requestToOidcServer) {
      return next.handle(request);
    }

    return from(this.authService.isAuthenticated()).pipe(
      tap(result => console.debug('INTERCEPTOR isAuthenticated result', result)),
      switchMap(result => next.handle(request))
    );
  }
}
