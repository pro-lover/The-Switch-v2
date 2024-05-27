import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpXsrfTokenExtractor } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable()
export class XsrfInterceptor implements HttpInterceptor {
	constructor(
		//private xsrfCookieExtractor: XsrfCookieExtractor,
		private tokenExtractor: HttpXsrfTokenExtractor
		//private _cookieName: string = 'XSRF-TOKEN',
		//private _headerName: string = 'X-XSRF-TOKEN'
	) { }


	intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {

		const cookieheaderName = 'X-XSRF-TOKEN';

		const csrfToken = this.tokenExtractor.getToken() as string;
		if (csrfToken !== null && !request.headers.has(cookieheaderName)) {
			request = request.clone({ headers: request.headers.set(cookieheaderName, csrfToken), withCredentials: true });
		}

		return next.handle(request);
		/**/
	}
}
