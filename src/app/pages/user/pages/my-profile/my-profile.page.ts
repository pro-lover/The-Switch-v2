
import { Location } from '@angular/common';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import {
	Account,
	Role
} from '@app/core/models';
import {
	AccountService
} from '@app/core/services';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import { AuthService } from '@pages/auth/services/auth.service';
import * as introJs from 'intro.js';

@Component({
	templateUrl: './my-profile.page.html',
	styleUrls: ['./my-profile.page.scss'],
})
export class MyProfilePage {

	Role = Role;
	account: Account | undefined;

	path = ROUTER_UTILS.config.base;

	//user onboarding
	private introJS = introJs();

	constructor(
		private router: Router,
		private authService: AuthService,
		private accountService: AccountService,
		private dialog: MatDialog,
		private location: Location,
		private _snackBar: MatSnackBar
	) {
		this.accountService.account.subscribe( (x:any) =>  {
			if( x === null ) {} else {
				this.account = x;
			}
		});

		this.onboarding();
	}

	public back(): void {
		this.location.back();
	}

	private onboarding(): void {

		this.introJS.setOptions({
			showStepNumbers: true,
			showProgress: true
			/** /
			steps: [
				{
					title: 'Template Banner Design',
					intro: "As an Admin user, you can design the layout of for the banner."
				}

				{
					element: '.walkthrough-adding-components',
					intro: "Click here to create a new account.",
					position: 'bottom-right-aligned'
				},
				/** /
			],
			/** /
			hints: [
				{
					element: '#mat-tab-label-0-0',
					hint: 'Click here to add new components.',
					hintPosition: 'top-middle',
				},
				{
					element: '#mat-tab-label-0-1',
					hint: 'Once a component is added. It will be listed in this tab for you to edit/save.',
					hintPosition: 'top-middle'
				}
			]
			/**/
		});
	}

	public help(): void {

		//this.introJS.refresh();

		//this.introJS.addHints();

		//this.introJS.showHints();

		//this.introJS.start();

		this._snackBar.open( 'Help/Onboarding Feature still in WIP.', 'close', {
			horizontalPosition: 'center',
			verticalPosition: 'top',
		});
	}
}
