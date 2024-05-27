import { Location } from '@angular/common';
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
	templateUrl: './howitworks.page.html',
	styleUrls: ['./howitworks.page.scss'],
})
export class HowitworksPage implements OnInit {
	path = ROUTER_UTILS.config;
	theme = ThemeList;

	public Role = Role;
	public account: Account | undefined;
	public isLoggedIn$!: Observable<boolean>;

	constructor(
		private authService: AuthService,
		private location: Location,
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

	public onClickChangeTheme(theme: ThemeList): void {
		this.themeService.setTheme(theme);
	}

	public back(): void {
		this.location.back();
	}
}
