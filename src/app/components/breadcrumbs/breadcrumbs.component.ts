import { Location } from '@angular/common';
import { Component, OnChanges, OnInit } from '@angular/core';
import { ActivatedRoute, Event, NavigationEnd, Params, Router } from '@angular/router';
import {
	Account, Role
} from '@app/core/models';
import { AccountService } from '@app/core/services';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';


export interface IBreadCrumb {
	label: string;
	url: string;
}

@Component(
	{
		selector: 'app-breadcrumbs',
		templateUrl: 'breadcrumbs.component.html',
		styleUrls: ['breadcrumbs.component.scss']
	}
)
export class NavBreadcrumbsComponent implements OnInit, OnChanges {
	Role = Role;
	account!: Account;

	menuItems!: any[];

	public breadcrumbs: IBreadCrumb[];

	public childPrjId: any;

	//@Input() childPrjId: string;
	//prjId: any;

	constructor(
		private router: Router,
		//private prms: Params,
		private location: Location,
		private activatedRoute: ActivatedRoute,
		private accountService: AccountService
	) {
		this.accountService.account.subscribe(x => this.account = x);

		this.breadcrumbs = this.buildBreadCrumb(this.activatedRoute.root);

		//console.warn('this.breadcrumbs:', this.breadcrumbs );
	}

	ngOnInit(): void {

		this.router.events.pipe(
			filter((event: Event) => event instanceof NavigationEnd),
			distinctUntilChanged(),
		)
			.subscribe((event: Event) => {
				
				this.breadcrumbs = this.buildBreadCrumb(this.activatedRoute.root);

			});

		////console.log('this.activatedRoute.parent', this.activatedRoute);
	}

	ngOnChanges() {
		//if( this.prjId ) {
		console.warn('PARENT-prjId:', this.childPrjId);
		//console.warn('prjIdLay:', this.prjIdLay);
		//}
	}

	public prjItem(newItem: any): void {
		//console.warn('PARENT-prjItem:', newItem);
	}

	public lastPrjId!: string;
	/**
	 * Recursively build breadcrumb according to activated route.
	 * @param route
	 * @param url
	 * @param breadcrumbs
	*/
	private buildBreadCrumb(route: ActivatedRoute, url = '', breadcrumbs: IBreadCrumb[] = []): IBreadCrumb[] {
		//If no routeConfig is avalailable we are on the root path
		let label = route.routeConfig && route.routeConfig.data ? route.routeConfig.data['breadcrumb'] : '';
		let path = route.routeConfig && route.routeConfig.data ? route.routeConfig.path : '';

		// If the route is dynamic route such as ':id', remove it
		/**/
		const lastRoutePart = path.split('/').pop();
		const isDynamicRoute = lastRoutePart.startsWith(':');

		const that = this;

		function replacer(match, p1, p2, p3, offset, string) {
			// p1 is nondigits, p2 digits, and p3 non-alphanumerics
			//console.warn('replacer:', match, p2);
			that.lastPrjId = p2;
			return string;
		}

		if (isDynamicRoute && !!route.snapshot) {
			const paramName = lastRoutePart.split(':')[1];
			path = path.replace(lastRoutePart, route.snapshot.params[paramName]);
			if (route.routeConfig.data['breadcrumb'] === 'Edit Project') {
				path = path.replace('edit/', '');
			}
			label = route.snapshot.params[paramName];

			if (route.routeConfig.data['breadcrumb'] === 'Project Detail') {
				this.lastPrjId = label;
			}
			//console.warn('Dynamic breadcrumb:', path.replace('edit/', ''), route.routeConfig.data.breadcrumb, lastRoutePart );
		}
		if (label === 'Project Detail') {
			//this.lastPrjId = label;

			if (this.lastPrjId === undefined) {
				const urll = window.location.pathname;
				urll.replace(/(projects\/)+(\d{1,3})(\/)(\w)+(\/)/, replacer);
			}
			path = path.replace(':projectId', this.lastPrjId).replace(/(\/\w+)/g, '');

		}
		////console.log('breadcrumb['+label+']:', path);
		////console.log('this.lastPrjId:', this.lastPrjId);

		/**/

		//In the routeConfig the complete path is not available,
		//so we rebuild it each time
		const nextUrl = path ? `${url}/${path}` : url;

		const breadcrumb: IBreadCrumb = {
			label: label,
			url: nextUrl,
		};

		// Only adding route with non-empty label
		const newBreadcrumbs = breadcrumb.label ? [...breadcrumbs, breadcrumb] : [...breadcrumbs];
		if (route.firstChild) {
			//If we are not on our current path yet,
			//there will be more children to look after, to build our breadcumb
			return this.buildBreadCrumb(route.firstChild, nextUrl, newBreadcrumbs);
		}
		return newBreadcrumbs;
	}

	/**
	 * Merges all parameters within the routing tree into a single observable.
	 * This allows child routes to access parameters from their parents
	 * @param route An activated route
	 */
	private routeParams(route: ActivatedRoute): Observable<Params> {
		return combineLatest(route.pathFromRoot.map(t => t.params))
			.pipe(
				map(paramObjects => Object.assign({}, ...paramObjects))
			);
	}
}
