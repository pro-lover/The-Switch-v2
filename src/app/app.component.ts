import { Component, OnInit, Renderer2 } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import {
	Account,
	Role
} from '@app/core/models';
import { AlertService, WebSocketService } from '@app/core/services';
import { AccountService, SeoService, ThemeService } from '@core/services';
import { AuthService } from '@pages/auth/services/auth.service';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Observable } from 'rxjs';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

	public Role = Role;
	public account: Account | undefined;

	public isLoggedIn$!: Observable<boolean>;

	public deviceInfo: any;

	previousUrl: string | undefined;

	constructor(
		private router: Router,
		private renderer: Renderer2,
		private accountService: AccountService,
		private deviceService: DeviceDetectorService,
		private seoService: SeoService,
		private themeService: ThemeService,
		private authService: AuthService,
		private alertService: AlertService,
		private webSocketService: WebSocketService
	) {

		this.accountService.account.subscribe((x: any) => {
			if (x === null) { } else {

				this.authService.isLoggedIn$.next(true);

				this.account = x;

				this.webSocketService.sendMessage({
					'sender': x.email,
					'content': `${x.firstName} has logged in.`,
					'channel': 'accounts',
					'model': 'account',
					'action': 'loggedin',
					'modelId': x.id,
					'isBroadcast': true
				});
			}
		});

		this.router.events
			.subscribe((event) => {
				if (event instanceof NavigationStart) {

					if (document.getElementById('primaryNav') !== null) {

						this.renderer.removeClass(document.getElementById('primaryNav'), 'show');
					}

					if (this.previousUrl) {
						this.renderer.removeClass(document.body, 'page-' + this.previousUrl);

					}
					event.url = event.url.replace(/\//g, '-');
					event.url = event.url.split('?')[0];
					const currentUrlSlug = event.url.slice(1);
					if (currentUrlSlug) {
						this.renderer.addClass(document.body, 'page-' + currentUrlSlug);
					}
					this.previousUrl = currentUrlSlug;

				}
			});

		this.deviceFunction();

	}

	ngOnInit(): void {
		this.isLoggedIn$ = this.authService.isLoggedIn$;
		this.runGlobalServices();
	}

	private runGlobalServices(): void {
		this.seoService.init();
		this.themeService.init();
	}

	private deviceFunction() {
		////console.log('hello `Home` component');
		this.deviceInfo = this.deviceService.getDeviceInfo();
		const isMobile = this.deviceService.isMobile();
		const isTablet = this.deviceService.isTablet();
		const isDesktopDevice = this.deviceService.isDesktop();
		//console.info('deviceInfo', this.deviceInfo);
		////console.log('isMobile', isMobile);  			// returns if the device is a mobile device (android / iPhone / windows-phone etc)
		////console.log('isTablet', isTablet);  				// returns if the device us a tablet (iPad etc)
		////console.log('isDesktopDevice', isDesktopDevice); 	// returns if the app is running on a Desktop browser.

		isMobile ? this.renderer.addClass(document.body, 'is-mobile') : this.renderer.removeClass(document.body, 'is-mobile');
		isTablet ? this.renderer.addClass(document.body, 'is-tablet') : this.renderer.removeClass(document.body, 'is-tablet');
		isDesktopDevice ? this.renderer.addClass(document.body, 'is-desktop') : this.renderer.removeClass(document.body, 'is-desktop');

		this.renderer.addClass(document.body, 'is-os-' + this.deviceInfo.os.toLowerCase());
		this.renderer.addClass(document.body, 'is-browser-' + this.deviceInfo.browser.toLowerCase());
		this.renderer.addClass(document.body, 'is-orientation-' + this.deviceInfo.orientation.toLowerCase());
	}
}
