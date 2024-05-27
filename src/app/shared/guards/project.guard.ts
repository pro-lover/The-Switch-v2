import { Injectable } from '@angular/core';
import { first, last,  catchError, map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { Observable, of } from 'rxjs';
import { Router, CanActivate, CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

import { ProjectService, AccountService } from '@app/core/services';

//import { DetailComponent } from '@app/admin/projects/details/detail.component';

@Injectable({ providedIn: 'root' })
export class ProjectAdminGuard implements CanActivate {

	constructor(
		private router: Router,
		private projectService: ProjectService,
		private accountService: AccountService
	) { }

	canDeact = true;

	/**/
	canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {

		const account = this.accountService.accountValue;

		if (account) {
			// check if route is restricted by role

			//console.warn('route.data.roles', route.data.roles, account.role, route.params);

			if (route.data.roles && !route.data.roles.includes(account.role)) {
				// role not authorized so redirect to home page
				this.router.navigate(['/']);
				return false;
			}

			/**/
			if( account.role === 'Admin' ) {
				return true;
			}
			/**/

			let projId = route.params.projectId ? route.params.projectId : route.params.id;

			/**/
			return forkJoin(
				this.accountService.getById(this.accountService.accountValue.id),
				this.projectService.getById(projId)
			)
			.pipe(
				map( (results:any) => {

					//console.warn('route.data', results);
					// current user not linked to any researchers
					if( results[0].accountResearchers.length <= 0 ){

						console.info('current user not linked to any researchers');

						this.router.navigate(['/']);
						return false;

					} else {

						let booy = results[1].projectLeaders.filter((y:any) => y.researcherId == results[0].accountResearchers[0].researcherId);

						//console.warn('route.data', booy);

						if( booy.length > 0 ) {
							// authorized so return true
							return true;
						} else {
							this.router.navigate(['/']);
							return false;
						}

					}

				}),
				catchError((err) => {
					console.error('Error:', err);
					this.router.navigate(['/admin'], { queryParams: { returnUrl: state.url }});
					return of(false);
				})
			)

		} else {

			// not logged in so redirect to login page with the return url
			this.router.navigate(['/admin'], { queryParams: { returnUrl: state.url }});
			return false;

		}

	}
	/**/

}
