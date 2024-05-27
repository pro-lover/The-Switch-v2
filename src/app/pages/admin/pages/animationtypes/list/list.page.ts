import { DatePipe, Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { DialogConfirmComponent, DialogRestoreComponent } from '@app/components';
import { Account, AnimationType } from '@app/core/models';
import { AccountService, AlertService, AnimationTypeService } from '@app/core/services';
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
export class AnimationTypesListPage implements OnInit, OnDestroy {

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
	public pageSizeOptions: number[] = [5, 10, 40, 100];

	// MatPaginator Output
	public pageEvent!: PageEvent;

	public statusFilterValue: any;

	private allData!: any[];//ComponentModel[];

	constructor(
		private alertService: AlertService,
		private dialog: MatDialog,
		private location: Location,
		private animationTypeService: AnimationTypeService,
		private accountService: AccountService,
		private datePipe: DatePipe
	) {
		this.statusFilterValue = new FormControl('');

		this.accountService.account
			.pipe(takeUntil(this._destroy$))
			.subscribe((x:any) => this.myaccount = x);

		this.animationTypeService.animationType
			.pipe(takeUntil(this._destroy$))
			.subscribe(
				(animationtypes:AnimationType[]) =>  {
					//console.log('collection subscription:', clients);

					this.allData = animationtypes;

					if( animationtypes !== undefined && animationtypes.length >= 0 ) {
						this.initialise(animationtypes);
					}
				}
			);
		this.onboarding();
	}

	ngOnInit() {
		this.animationTypeService.getAll()
			.pipe(first())
			.pipe(takeUntil(this._destroy$))
			.subscribe();
	}

	ngOnDestroy(): void {
		//console.warn('Animations Types List ngOnDestroy');
		this._destroy$.next(false);
		this._destroy$.complete();
	}
	public onFilterChange( filter:string ): void {

		let newdata: any;
		newdata = this.allData;

		console.log("data",newdata)

		if( this.statusFilterValue.value && this.statusFilterValue.value !== undefined ) {
			newdata = newdata.filter((x:any) => {
				return x.status === this.statusFilterValue.value
			});
		}

		this.initialise(newdata);
	}

	private initialise( animationtypes:AnimationType[]):void {

		this.primaryData = animationtypes;
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
        this.animationTypeService.updateStatus(id, params)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Record Status changed successfully.', { keepAfterRouteChange: true });

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
				this.animationTypeService.delete(id)
					.pipe(first())
					.subscribe({
						next: () => {
							this.alertService.success(  model.name + ' deleted successfully.', { keepAfterRouteChange: true });
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
				this.animationTypeService.restore(id)
					.pipe(first())
					.subscribe({
						next: () => {
							this.alertService.success(  model.name + ' Restored successfully.', { keepAfterRouteChange: true });
							model.isDeleting = false;

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

		this.alertService.info( 'Help/Onboarding Feature still in WIP..', { keepAfterRouteChange: true });
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
		XLSX.writeFile(wb, 'BAPP_Available_Animation_Types.xlsx');

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
