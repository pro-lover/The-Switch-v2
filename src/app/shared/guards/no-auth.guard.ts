import { Injectable } from '@angular/core';
import { CanLoad, Router } from '@angular/router';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import { AuthService } from '@pages/auth/services/auth.service';

@Injectable({
	providedIn: 'root',
})
export class NoAuthGuard implements CanLoad {
	constructor(private router: Router, private authService: AuthService) {}

	canLoad(): boolean {
		const isLoggedIn = this.authService.isLoggedIn;

		if (isLoggedIn) {
			this.router.navigate([ROUTER_UTILS.config.base.home]);
			return false;
		}

		return true;
	}
}
