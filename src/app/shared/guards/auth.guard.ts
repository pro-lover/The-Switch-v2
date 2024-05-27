import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, NavigationEnd, Router, RouterStateSnapshot } from '@angular/router';
import { AccountService } from '@app/core/services';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

	previousUrl: string | undefined;

	constructor(
		private router: Router,
		private accountService: AccountService
	) {
		//this.previousUrl = router.url;

		this.router.events
			.subscribe((event) => {
				if (event instanceof NavigationEnd) {
					this.previousUrl = event.url ;
				}
			});
	 }

	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
		const account = this.accountService.accountValue;
		if (account) {
			// check if route is restricted by role
			if (route.data['roles'] && !route.data['roles'].includes(account.role)) {
				// role not authorized so redirect to home page
				console.warn('role not authorized:', account.role, route.data, this.previousUrl, route);
				this.router.navigate(['/']);
				return false;
			}

			// authorized so return true
			return true;
		}

		// not logged in so redirect to login page with the return url
		this.router.navigate(['/account/login'], { queryParams: { returnUrl: state.url }});
		return false;
	}
}
