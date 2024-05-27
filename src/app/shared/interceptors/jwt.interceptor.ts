import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AccountService } from '@app/core/services';
import { environment } from '@env/environment';
import { Observable } from 'rxjs';


@Injectable()
export class JwtInterceptor implements HttpInterceptor {
	constructor(private accountService: AccountService) { }

	intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		// add auth header with jwt if account is logged in and request is to the api url
		const account = this.accountService.accountValue;
		const isLoggedIn = account && account.jwtToken;
		const isApiUrl = request.url.startsWith(environment.apiUrl);
		if (isLoggedIn && isApiUrl) {
			request = request.clone({
				setHeaders: { Authorization: `Bearer ${account.jwtToken}` }
			});
		}

		return next.handle(request);
	}
}
