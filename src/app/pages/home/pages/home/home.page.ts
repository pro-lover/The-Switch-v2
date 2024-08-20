import { Component, OnInit } from '@angular/core';
import {
	Account,
	Role
} from '@app/core/models';
import { AccountService } from '@core/services';
import { ThemeList, ThemeService } from '@core/services/theme';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import { AuthService } from '@pages/auth/services/auth.service';
import { BehaviorSubject, combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { Banner, BannerSize, BannerType, Client, FontType, Project, Template } from '@app/core/models';
import { AlertService, BannerCreatorService, BannerService, BannerSizeService, BannerTypeService, ClientService, FontTypeService, ProjectService, TemplateService, WebWorkerService } from '@app/core/services';
import { map, takeUntil } from 'rxjs/operators';

@Component({
	templateUrl: './home.page.html',
	styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
	path = ROUTER_UTILS.config;
	theme = ThemeList;
	private _destroy$ = new Subject<boolean>();

	public Role = Role;
	public account: Account | undefined;
	public isLoggedIn$!: Observable<boolean>;
	public activeBannerSizes: any[] = [];

		// FORM DATA
		public dashboardData$!: Observable<any>;
		public uiDataReady = false;
		public BannerSizes!: BannerSize[];
		public BannerTypes!: BannerType[];
		public Clients!: Client[];
		public Projects!: Project[];
		public Templates!: Template[];
	
		private selectedClient?: Subscription;
		private selectedProject?: Subscription;
		private selectedCreativeType?: Subscription;
		private selectedProjectTemplate?: Subscription;
		private selectedProjectTemplateBanners?: Subscription;

	constructor(
		private authService: AuthService,
		private themeService: ThemeService,
		private accountService: AccountService,
		private templateService: TemplateService,
		private clientService: ClientService,
		private bannerService: BannerService,
		private bannerTypeService: BannerTypeService,
		private bannerSizeService: BannerSizeService,
		private projectService: ProjectService,
		private bannerCreatorService: BannerCreatorService,
		private fontTypeService: FontTypeService,
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


		this.initialise();
		console.warn("[1] activeBannerSizes")
		console.warn(this.activeBannerSizes)
	}

	onClickChangeTheme(theme: ThemeList): void {
		this.themeService.setTheme(theme);
	}

	private initialise(): void {
		console.info('[2] initialise');

		this.dashboardData$ = combineLatest(
			[
				this.templateService.getAll(),
				this.clientService.getAll(),
				this.bannerTypeService.getAll(),
				this.bannerSizeService.getAll(),
				this.projectService.getAll(),
				this.fontTypeService.getAll()
			]
		)
			.pipe(
				map(([templates, clients, bannertypes, bannersizes, projects, fonttypes]): any => {
					console.info('combineLatest initialise', [templates, clients, bannertypes, bannersizes, projects, fonttypes]);
					//console.log(templates.getChildByName())
					// combineLatest returns an array of values, here we map those values to an object
					return { templates, clients, bannertypes, bannersizes, projects, fonttypes };
				})
			);

		this.dashboardData$.pipe(takeUntil(this._destroy$)).subscribe((data: any) => {
			console.info('Dashboard Component initialise', data);

			//this.prepDashboardData(data);
		});

	}

}
