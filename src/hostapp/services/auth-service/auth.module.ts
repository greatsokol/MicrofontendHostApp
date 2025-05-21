import {ModuleWithProviders, NgModule} from "@angular/core";
import {HTTP_INTERCEPTORS, HttpClientModule} from "@angular/common/http";
import {OAuthModule} from "angular-oauth2-oidc";
import {IsAuthenticatedInterceptor} from "./interceptors";


@NgModule({
    imports: [
        HttpClientModule,
        OAuthModule.forRoot({
                resourceServer: {
                    allowedUrls: ["http"],
                    sendAccessToken: true
                }
            }
        ),
    ],
    providers: [
        {provide: HTTP_INTERCEPTORS, useClass: IsAuthenticatedInterceptor, multi: true},
    ]
})
export class AuthModule {
    public static forRoot(): ModuleWithProviders<AuthModule> {
        return {
            ngModule: AuthModule,
            providers: [
                // {
                //   provide: HTTP_INTERCEPTORS, useClass: IsAuthenticatedInterceptor, multi: true
                // }
            ]
        };
    }
}
