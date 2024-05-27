import { DatePipe, Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { DialogConfirmComponent, DialogRestoreComponent } from '@app/components';
import { Account, Client } from '@app/core/models';
import { AccountService, AlertService, ClientService } from '@app/core/services';
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
export class ClientsListPage implements OnInit, OnDestroy {

	// will use the _destroy$ observable to control
	// fetching items from an observable
	private _destroy$ = new Subject<boolean>();

	public primaryData!: any[];
	public sortedData!: any[];

	public myaccount!: Account;

	//user onboarding
	private introJS = introJs();

	// MatPaginator Inputs
	public length!: number;
	public pageSize = 10;
	public currentPage = 0;
	public pageSizeOptions: number[] = [5, 10, 15, 20, 25, 30, 35, 40, 100];

	private allData!: any[];//Model[];

	// MatPaginator Output
	public pageEvent!: PageEvent;

	//  select filter data

	public statusFilterValue: any;

	constructor(
		private alertService: AlertService,
		private dialog: MatDialog,
		private location: Location,
		private clientService: ClientService,
		private accountService: AccountService,
		private datePipe: DatePipe
	) {
		this.statusFilterValue = new FormControl('');

		this.accountService.account
			.pipe(takeUntil(this._destroy$))
			.subscribe((x:any) => this.myaccount = x);

		this.clientService.client
			.pipe(takeUntil(this._destroy$))
			.subscribe(
				(clients:Client[]) =>  {
					//console.log('collection subscription:', clients);

					this.allData = clients;

					if( clients !== undefined && clients.length > 0 ) {
						this.initialise(clients);

					}
				}
			);

		this.onboarding();

	}

	ngOnInit() {

		this.clientService.getAll()
			.pipe(first())
			.pipe(takeUntil(this._destroy$))
			.subscribe();

	}

	ngOnDestroy(): void {
		//console.warn('Client List ngOnDestroy');
		this._destroy$.next(false);
		this._destroy$.complete();
	}

	public onFilterChange( filter:string ): void {

		let newdata: any;

		newdata = this.allData;

		if( this.statusFilterValue.value && this.statusFilterValue.value !== undefined ) {
			newdata = newdata.filter((x:any) => {
				return x.status === this.statusFilterValue.value
			});
		}

		this.initialise(newdata);

	}
	private initialise( clients:Client[]):void {

		this.primaryData = clients;
		this.sortedData = this.primaryData.slice();

		this.length = this.sortedData.length;

		this.iterator();

	}

	public toggleStatus(event:any, id: string):void {

		/**/
		this.updateStatus(id, {
			status: event.checked
		});
		/**/
	}

	private updateStatus( id: string, params: any ):void {
        this.clientService.updateStatus(id, params)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Record Status changed successfully', { keepAfterRouteChange: true });
                    //this.router.navigate(['../../'], { relativeTo: this.route });

                },
                error: error => {
                    this.alertService.error(error);
                    //this.loading = false;
                }
            });
	}

	public deleteModel(id: string): void {
		const model = this.primaryData.find((x) => x.id === id);
		model.isDeleting = true;

		const confirmDialog = this.dialog.open( DialogConfirmComponent, {
			data: {
				title: 'Confirm Delete Action',
				message: 'Are you sure you want to delete: ' + model.name
			}
		});
		confirmDialog.afterClosed().subscribe(result => {
			if (result === true) {

				/**/
				this.clientService.delete(id)
					.pipe(first())
					.subscribe({
						next: () => {
							model.isDeleting = false;
							this.alertService.success(  model.name + ' Deleted successfully.', { keepAfterRouteChange: true });
							this.primaryData.find((x) => {
								if( x.id === id ) {
									x.deletedAt = new Date();
									x.status = false;
									//console.log('update model', this.primaryData);
									this.iterator();
								}
							});
						},
						error: (error:string) => {
							this.alertService.error(error);
							model.isDeleting = false;
						}
					});
				/**/
			} else {
				//console.info('Cancel Removing ID:', id);

				model.isDeleting = false;
			}
		});
	}

	public restoreModel(id: string): void {
		const model = this.primaryData.find((x) => x.id === id);
		model.isDeleting = true;

		const confirmDialog = this.dialog.open( DialogRestoreComponent, {
			data: {
				title: 'Confirm Restoration Action',
				message: 'Are you sure you want to restore this record: ' + model.name
			}
		});
		confirmDialog.afterClosed().subscribe(result => {
			if (result === true) {

				/**/
				this.clientService.restore(id)
					.pipe(first())
					.subscribe({
						next: () => {
							this.alertService.success(  model.name + ' Restored successfully.', { keepAfterRouteChange: true });
							model.isDeleting = false;
							this.primaryData.find((x) => {
								if( x.id === id ) {
									x.deletedAt = null;
									x.status = true;
									//console.log('update model', this.primaryData);
									this.iterator();
								}
							});

						},
						error: (error:string) => {
							this.alertService.error(error);
							model.isDeleting = false;
						}
					});
				/**/
			} else {
				//console.info('Cancel Restoring record ID:', id);

				model.isDeleting = false;
			}
		});
	}

	public back(): void {
		this.location.back();
	}

	private onboarding(): void {

		this.introJS.setOptions({
		showStepNumbers: true,
		showProgress: true,
			steps : [
				{
					intro: 'Click here to create a new client.',
					title: 'Clients',
					element: '#hint-action-btn-create'
				},
				{

					intro: 'Click here to download a spreadsheet with a list of all clients.',
					element: '#hint-action-btn-export'
				},
				{
					intro: 'Click here to go back to previous page.',
					element: '#hint-action-btn-back'
				},
				{
					intro: 'Enable client status so client may appear when creating a new template or, disable so it may not show when creating a new template on dashboard.',
					element: '.toggle-status'
				},
				{
					intro: 'Click here to edit client name and or description.',
					element: '#btn-edit'
				},
				{
					intro: 'Click here to get client history.',
					element: '#btn-audit'
				},
				{
					intro: 'Click here to delete client.',
					element: '#btn-delete'
				}
			]
		  });
	}

	public help(): void {

		this.introJS.start();

	}

	public audit( id:number ): void {

		const model = this.primaryData.find((x) => x.id === id);
		model.isVC = false;

		this.alertService.info( 'Version History still in WIP.', { keepAfterRouteChange: true });

	}

	public export(): void {

		const exportArray = this.primaryData.map( (data, index) => {
			return {
				'ID': data.id,
				'Name': data.name,
				'Description': data.description,
				'No. of Projects' : data.projects.length,
				'No. of Templates' : data.templates.length,
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
		XLSX.writeFile(wb, 'BAPP_Clients.xlsx');

	}

	// PAGINATION FUNCS
	public sortData(sort: Sort) : void {

		const data = this.sortedData.slice();
		if (!sort.active || sort.direction === '') {
			this.sortedData = data;
			return;
		}

		this.sortedData = data.sort((a, b) => {
			const isAsc = sort.direction === 'asc';
			switch (sort.active) {
				case 'id': return this.compare(a.id, b.id, isAsc);
				case 'name': return this.compare(a.name, b.name, isAsc);
				case 'description': return this.compare(a.description, b.description, isAsc);
				case 'projects': return this.compare(a.projects.length, b.projects.length, isAsc);
				case 'templates': return this.compare(a.templates.length, b.templates.length, isAsc);
				case 'status': return this.compare(a.status, b.status, isAsc);
				case 'lastEditedBy': return this.compare(a.lastEditedBy, b.lastEditedBy, isAsc);
				case 'created': return this.compare(a.created, b.created, isAsc);
				case 'updated': return this.compare(a.updated, b.updated, isAsc);
				case 'deletedAt': return this.compare(a.deletedAt, b.deletedAt, isAsc);
				default: return 0;
			}
		});
	}

	private compare(a: number | string | boolean, b: number | string | boolean, isAsc: boolean) : number {
		return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
	}

	public setPageSizeOptions(setPageSizeOptionsInput: string): void {
		if (setPageSizeOptionsInput) {
			this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
		}
	}

	public handlePage(e: any): void {
		this.currentPage = e.pageIndex;
		this.pageSize = e.pageSize;
		this.iterator();
	}

	private iterator(): void {
		const end = (this.currentPage + 1) * this.pageSize;
		const start = this.currentPage * this.pageSize;
		const part = this.primaryData.slice(start, end);
		this.sortedData = part;
	}

}
