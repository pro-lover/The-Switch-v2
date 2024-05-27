import { Component, OnInit } from '@angular/core';
import {
	Account,
	Role
} from '@app/core/models';
import { AccountService } from '@core/services';
import { ThemeList, ThemeService } from '@core/services/theme';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import { AuthService } from '@pages/auth/services/auth.service';
import { Observable } from 'rxjs';


@Component({
	templateUrl: './home.page.html',
	styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
	path = ROUTER_UTILS.config;
	theme = ThemeList;

	public Role = Role;
	public account: Account | undefined;
	public isLoggedIn$!: Observable<boolean>;

	constructor(
		private authService: AuthService,
		private themeService: ThemeService,
		private accountService: AccountService,
	) {
		this.accountService.account.subscribe( (x:any) =>  {
			if( x === null ) {} else {

				this.authService.isLoggedIn$.next(true);

				this.account = x;
			}
		});
	}

	ngOnInit(): void {
		this.isLoggedIn$ = this.authService.isLoggedIn$;
	}

	onClickChangeTheme(theme: ThemeList): void {
		this.themeService.setTheme(theme);
	}
}
