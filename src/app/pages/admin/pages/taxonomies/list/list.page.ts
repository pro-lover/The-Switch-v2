import { DatePipe, Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { DialogConfirmComponent } from '@app/components';
import { Account, Taxonomy } from '@app/core/models';
import { AccountService, AlertService, TaxonomyService } from '@app/core/services';
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
export class TaxonomiesListPage implements OnInit, OnDestroy {

	// will use the _destroy$ observable to control
	// fetching items from an observable
	private _destroy$ = new Subject<boolean>();

	primaryData!: any[];
	sortedData!: any[];

	myaccount!: Account;

	// MatPaginator Inputs
	public length!: number;
	public pageSize = 10;
	public currentPage = 0;
	public pageSizeOptions: number[] = [5, 10, 40, 100];

	// MatPaginator Output
	public pageEvent!: PageEvent;

	constructor(
		private alertService: AlertService,
		private dialog: MatDialog,
		private location: Location,
		private taxonomyService: TaxonomyService,
		private accountService: AccountService,
		private datePipe: DatePipe
	) {

		this.accountService.account
			.pipe(takeUntil(this._destroy$))
			.subscribe((x:any) => this.myaccount = x);

	}

	ngOnInit() {
		this.initialise();
	}

	ngOnDestroy(): void {
		//console.warn('Taxonomies List ngOnDestroy');
		this._destroy$.next(false);
		this._destroy$.complete();
	}

	private initialise():void {
		this.taxonomyService.getAll()
			.pipe(first())
			.subscribe((taxonomies:Taxonomy[]) => {

				this.primaryData = taxonomies;
				this.sortedData = this.primaryData.slice();

				this.length = this.sortedData.length;

				this.iterator();
			});
	}

	public toggleStatus(event:any, id: string):void {

		/**/
		this.updateStatus(id, {
			status: event.checked
		});
		/**/
	}

	private updateStatus( id: string, params: any ):void {
        this.taxonomyService.updateStatus(id, params)
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
				message: 'Are you sure you want to delete: ' + model.Name
			}
		});
		confirmDialog.afterClosed().subscribe(result => {
			if (result === true) {

				/**/
				this.taxonomyService.delete(id)
					.pipe(first())
					.subscribe({
						next: () => {
							//this.primaryData = this.primaryData.filter(x => x.id !== id);
							this.alertService.success(  model.Name + ' Deleted successfully.', { keepAfterRouteChange: true });
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

	public back(): void {
		this.location.back();
	}

	public audit( id:number ): void {

		const model = this.primaryData.find((x) => x.id === id);
		model.isVC = false;

		this.alertService.info( 'Version History still in WIP.', { keepAfterRouteChange: true });

	}
	public export(): void {

		const exportArray = this.primaryData.map( (data) => {

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
		XLSX.writeFile(wb, 'BAPP_All_Taxonomies.xlsx');

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
