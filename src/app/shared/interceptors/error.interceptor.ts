import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
//import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AccountService, AlertService } from '@app/core/services';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';


@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

	path = ROUTER_UTILS.config.base;

	constructor(
		private router: Router,
		private alertService: AlertService,
		//private _snackBar: MatSnackBar,
		private accountService: AccountService
	) { }

	intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
		return next.handle(request).pipe(catchError(err => {
			if ([401, 403].includes(err.status) && this.accountService.accountValue) {
				// auto logout if 401 or 403 response returned from api
				const { root, signIn } = ROUTER_UTILS.config.auth;

				this.accountService.logout();

				this.alertService.error( 'Action Not Permitted for your current Role.  Please contact the Admin.', { keepAfterRouteChange: true });

				this.router.navigate(['/', root, signIn]);

				/*
				this._snackBar.open( 'Action Not Permitted for your current Role.  Please contact the Admin.', 'close', {
					horizontalPosition: 'center',
					verticalPosition: 'top',
					panelClass: ['error-snackbar']
				});
				/**/
			}

			const error = (err && err.error && err.error.message) || err.statusText;
			//console.error(error, err);
			return throwError(error);
		}))
	}
}
