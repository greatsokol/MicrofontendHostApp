import {inject, Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {from, Observable, switchMap, tap} from 'rxjs';
import {AuthService} from "../auth.service";


@Injectable()
export class IsAuthenticatedInterceptor implements HttpInterceptor {
  private authService = inject(AuthService);

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const url = request.url;
    if (url.startsWith('assets/')) {
      return next.handle(request);
    }

    const requestToOidcServer = url.startsWith(this.authService.getIssuerUri());
    console.debug(`INTERCEPTOR request uri: ${url}, ` +
      `request to OIDC: ${requestToOidcServer}, ` +
      `roles: ${this.authService.getUserRoles()}, ` +
      `context: ${request.context}`);

    if (requestToOidcServer) {
      return next.handle(request);
    }

    return from(this.authService.authenticate()).pipe(
      tap(result => console.debug('INTERCEPTOR isAuthenticated result', result)),
      switchMap(result => next.handle(request))
    );
  }
}
