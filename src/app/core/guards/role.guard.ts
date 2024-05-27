import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AccountService } from '@app/core/services';
import { Observable } from 'rxjs';
import { ROUTER_UTILS } from '../utils/router.utils';

@Injectable({
	providedIn: 'root',
})
export class RoleGuard implements CanActivate {

	constructor(
		private router: Router,
		private accountService: AccountService
	) {}

	canActivate( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ):
		| Observable<boolean | UrlTree>
		| Promise<boolean | UrlTree>
		| boolean
		| UrlTree {

			const account = this.accountService.accountValue;
			const { root, signIn } = ROUTER_UTILS.config.auth;

			if (account) {

				if (
					route.data['roles'] && !route.data['roles'].includes(account.role)
				) {
					// role not authorized so redirect to home page
					//this.router.navigate(['/']);
					this.router.navigate(['/', root, signIn], {
						queryParams: { returnUrl: state.url }
					});

					this.accountService.logout();
					return false;

				} else {
					return true;
				}

			} else {

				// not logged in so redirect to login page with the return url
				// this.router.navigate(['/admin'], { queryParams: { returnUrl: state.url }});

				this.router.navigate(['/', root, signIn], {
					queryParams: { returnUrl: state.url }
				});

				return false;
			}
			// const routeRoles = next.data.roles;
			// const userRoles = [];
			// const hasRole =
			//   routeRoles &&
			//   userRoles &&
			//   routeRoles.some((routeRole) =>
			//     userRoles.some((userRole) => routeRole === userRole.name),
			//   );

			// if (hasRole) {
			//   return true;
			// }

			// this.router.navigate([`/${ROUTER_UTILS.config.errorResponse.notFound}`]);
			// return false;
			return true;
	}
}
