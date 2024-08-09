import { DatePipe, Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { DialogConfirmComponent, DialogRestoreComponent } from '@app/components';
import { Account } from '@app/core/models';
import { AccountService, AlertService } from '@app/core/services';
import * as introJs from 'intro.js';
import { Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';
import * as XLSX from 'xlsx';

@Component({
	templateUrl: './list.page.html',
	styleUrls: ['./list.page.scss'],
	providers: [
		DatePipe
	]
})
export class AccountsListPage implements OnInit, OnDestroy {

	// will use the _destroy$ observable to control
	// fetching items from an observable
	private _destroy$ = new Subject<boolean>();

	public primaryData!: any[];
	public sortedData!: any[];

	myaccount!: Account;

	//user onboarding
	private introJS = introJs();

	// MatPaginator Inputs
	public length!: number;
	public pageSize = 40;
	public currentPage = 0;
	public pageSizeOptions: number[] = [5, 10, 40, 100];

	// MatPaginator Output
	public pageEvent!: PageEvent;

	public statusFilterValue: any;

	private allData!: any[];//ComponentModel[];

	constructor(
		private alertService: AlertService,
		private dialog: MatDialog,
		private location: Location,
		private accountService: AccountService,
		private datePipe: DatePipe
	) {
		this.statusFilterValue = new FormControl('');

		this.accountService.account
			.pipe(takeUntil(this._destroy$))
			.subscribe((x: any) => this.myaccount = x);

		this.accountService.getAll()
			.pipe(takeUntil(this._destroy$))
			.subscribe(
				(accounts: Account[]) => {

					this.allData = accounts;

					//console.log("allData",this.allData)

					if (accounts !== undefined && accounts.length > 0) {
						this.initialise(accounts);
					}
				}
			);

		this.onboarding();

	}

	ngOnInit() {
		this.accountService.getAll()
			.pipe(first())
			.pipe(takeUntil(this._destroy$))
			.subscribe();

		// /account/login
		//console.warn('this.router.url:', this.router.url);
	}

	ngOnDestroy(): void {
		//console.warn('Event Types List ngOnDestroy');
		this._destroy$.next(false);
		this._destroy$.complete();
	}
	public onFilterChange(filter: string): void {

		let newdata: any;

		// use form patch value
		// show meta data table when editing
		//this.clientFilterValue.value = '';
		//this.templateFilterValue.value = '';
		///this.bannersizeFilterValue.value = '';
		//this.bannertypeFilterValue.value = '';

		//console.warn('onFilterChange:', filter, this.clientFilterValue.value, this.templateFilterValue.value, this.bannersizeFilterValue.value, this.bannertypeFilterValue.value, this.statusFilterValue.value);

		newdata = this.allData;

		if (this.statusFilterValue.value && this.statusFilterValue.value !== undefined) {
			newdata = newdata.filter((x: any) => {
				return x.status === this.statusFilterValue.value
			});
		}

		this.initialise(newdata);

		/** /
		switch (filter) {

			case 'client':

				if( this.clientFilterValue.value === undefined ) {
					this.initialise(this.allData);
				} else {

					newdata = this.allData.filter((x) => {
						return x.container.banner.template.clientId === this.clientFilterValue.value
					});

					this.initialise(newdata);
				}

				break;

			case 'template':

				if( this.templateFilterValue.value === undefined ) {
					this.initialise(this.allData);
				} else {

					newdata = this.allData.filter((x) => {
						return x.container.banner.templateId === this.templateFilterValue.value
					});

					this.initialise(newdata);
				}

				break;

			case 'bannertype':

				if( this.bannertypeFilterValue.value === undefined ) {
					this.initialise(this.allData);
				} else {

					newdata = this.allData.filter((x) => {
						return x.container.banner.bannertypeId === this.bannertypeFilterValue.value
					});

					this.initialise(newdata);
				}

				break;

			case 'bannersize':

				if( this.bannersizeFilterValue.value === undefined ) {
					this.initialise(this.allData);
				} else {

					newdata = this.allData.filter((x) => {
						return x.container.banner.bannersizeId === this.bannersizeFilterValue.value
					});

					this.initialise(newdata);
				}

				break;

			case 'status':

				newdata = this.allData.filter((x) => {
					return x.status === this.statusFilterValue.value
				});

				this.initialise(newdata);

				break;

			default:

				this.initialise(this.allData);

				break;
		}
		/**/

	}

	private initialise(accounts: Account[]): void {

		this.primaryData = accounts;
		this.sortedData = this.primaryData.slice();

		this.length = this.sortedData.length;

		//console.log("Acc",this.primaryData);

		this.iterator();

	}

	public audit(id: number): void {

		const model = this.primaryData.find((x) => x.id === id);
		model.isVC = true;

		this.alertService.info('Version History still in WIP.', { keepAfterRouteChange: true });
	}

	public export(): void {

		const exportArray = this.primaryData.map((data) => {

			return {
				'ID': data.id,
				'Title': data.title,
				'First Name': data.firstName,
				'Last Name': data.lastName,
				'Email': data.email,
				'Role': data.role,
				'Verified': (data.isVerified === true) ? 'Yes' : 'No',
				'Status': (data.status === true) ? 'Active' : 'Inactive',
				'created': this.datePipe.transform(data.created, 'yyyy-MM-dd HH:mm:ss'),
				'updated': this.datePipe.transform(data.updated, 'yyyy-MM-dd HH:mm:ss'),
				'deletedAt': this.datePipe.transform(data.deletedAt, 'yyyy-MM-dd HH:mm:ss')
			}

		});

		/* generate worksheet */
		const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportArray);

		/* generate workbook and add the worksheet */
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

		/* save to file */
		XLSX.writeFile(wb, 'BAPP_Accounts.xlsx');

	}

	public toggleStatus(event: any, id: number) {

		/**/
		this.updateStatus(id, {
			status: event.checked
		});
		/**/
	}

	private updateStatus(id: number, params: any) {
		this.accountService.updateStatus(id, params)
			.pipe(first())
			.subscribe({
				next: () => {
					this.alertService.success('Account Status changed successfully', { keepAfterRouteChange: true });
					//this.router.navigate(['../../'], { relativeTo: this.route });

				},
				error: error => {
					this.alertService.error(error);
					//this.loading = false;
				}
			});
	}

	public deleteAccount(id: string) {
		const account = this.primaryData.find(x => x.id === id);
		account.isDeleting = true;

		const confirmDialog = this.dialog.open(DialogConfirmComponent, {
			data: {
				title: 'Confirm Deleting Account',
				message: 'Are you sure you want to delete Account: ' + account.title + ' ' + account.firstName + ' ' + account.lastName
			}
		});
		confirmDialog.afterClosed().subscribe(result => {
			if (result === true) {
				//console.warn('Removing Account ID:', id);

				/**/
				this.accountService.delete(id)
					.pipe(first())
					.subscribe({
						next: () => {
							//this.accounts = this.accounts.filter(x => x.id !== id);
							//account.isDeleting = false;
							this.alertService.success('Account Deleted successfully.', { keepAfterRouteChange: true });
						},
						error: error => {
							this.alertService.error(error);
							account.isDeleting = false;
						}
					});
				/**/
			} else {
				//console.info('Cancel Removing Account ID:', id);

				account.isDeleting = false;
			}
		});
	}

	public restore(id: number) {

		const account = this.primaryData.find(x => x.id === id);

		/***/
		const confirmDialog = this.dialog.open(DialogRestoreComponent, {
			data: {
				title: 'Confirm Restoring Record',
				message: 'Are you sure you want to restore Account: ' + account.title + ' ' + account.firstName + ' ' + account.lastName
			}
		});
		confirmDialog.afterClosed().subscribe(result => {
			if (result === true) {

				this.accountService.restore(id)
					.pipe(first())
					.subscribe({
						next: () => {
							this.alertService.success('Record restored successfully.', { keepAfterRouteChange: true });
						},
						error: error => {
							this.alertService.error(error);
						}
					});

			} else {
				//console.info('Cancel Restoring ID:', id);
			}
		});
		/***/
	}

	public back(): void {
		this.location.back();
	}

	private onboarding(): void {

		this.introJS.setOptions({
			showStepNumbers: true,
			showProgress: true,

			steps: [
				{
					title: 'Total Accounts',
					element: '#hint-action-btn-create',
					intro: "Click here to create a new user account."
				},
				{
					element: '#hint-action-btn-export',
					intro: "Click here to download a spreadsheet with a list of all users.",
				},
				{
					element: '#hint-action-btn-back',
					intro: "Click here to go back to previous page.",
				},
				{
					element: '#toggle-status',
					intro: "Click here to enable user or disable user.",
				},
				{
					element: '#edit-btn',
					intro: "Click here to edit user's details.",
				},
				{
					element: '#btn-editProfile',
					intro: "Click here to edit user's profile.",
				},
				{
					element: '#btn-audit',
					intro: "Click here to get user's history.",
				},
				{
					element: '#btn-delete',
					intro: "Click here to delete a user.",
				},
			],
		});
	}

	public help(): void {

		//this.introJS.refresh();

		//this.introJS.addHints();

		//this.introJS.showHints();

		this.introJS.start();

	}

	public sortData(sort: Sort) {
		//const data = this.accounts.slice();
		const data = this.sortedData.slice();
		if (!sort.active || sort.direction === '') {
			this.sortedData = data;
			return;
		}

		this.sortedData = data.sort((a, b) => {
			const isAsc = sort.direction === 'asc';
			switch (sort.active) {
				case 'id': return this.compare(a.id, b.id, isAsc);
				case 'lastName': return this.compare(a.lastName, b.lastName, isAsc);
				case 'verified': return this.compare(a.isVerified, b.isVerified, isAsc);
				case 'status': return this.compare(a.status, b.status, isAsc);
				case 'email': return this.compare(a.email, b.email, isAsc);
				case 'role': return this.compare(a.role, b.role, isAsc);
				default: return 0;
			}
		});
	}

	private compare(a: number | string | boolean, b: number | string | boolean, isAsc: boolean) {
		return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
	}

	public setPageSizeOptions(setPageSizeOptionsInput: string) {
		if (setPageSizeOptionsInput) {
			this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
		}
	}

	public handlePage(e: any) {
		this.currentPage = e.pageIndex;
		this.pageSize = e.pageSize;
		this.iterator();
	}

	private iterator() {
		const end = (this.currentPage + 1) * this.pageSize;
		const start = this.currentPage * this.pageSize;
		const part = this.primaryData.slice(start, end);
		this.sortedData = part;
	}

}
