import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { DatePipe, Location } from '@angular/common';
import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { DialogConfirmComponent, DialogRestoreComponent } from '@app/components';
import { Account, FontType } from '@app/core/models';
import { AccountService, AlertService, FontTypeService } from '@app/core/services';
import * as introJs from 'intro.js';
import { Observable, Subject } from 'rxjs';
import { first, map, startWith, takeUntil } from 'rxjs/operators';
import * as XLSX from 'xlsx';

@Component({
	templateUrl: './list.page.html',
	styleUrls: ['./list.page.scss'],
	providers: [
		DatePipe
	]
})
export class FontTypesListPage implements OnInit, OnDestroy {

	// will use the _destroy$ observable to control
	// fetching items from an observable
	private _destroy$ = new Subject<boolean>();

	public primaryData!: any[];
	public sortedData!: any[];

	public myaccount!: Account;

	// MatPaginator Inputs
	public length!: number;
	public pageSize = 10;
	public currentPage = 0;
	public pageSizeOptions: number[] = [5, 10, 40, 100];

	// MatPaginator Output
	public pageEvent!: PageEvent;

	//user onboarding
	private introJS = introJs();

	private allData!: any[];//ComponentModel[];
	// autocomplete
	chipCtrl = new FormControl();
	visible = true;
	selectable = true;
	removable = true;
	addOnBlur = true;
	readonly separatorKeysCodes: number[] = [ENTER, COMMA];
	@ViewChild('chipInput') chipInput!: ElementRef;

	//  select filter data
	public weightFilterValue: any;
	public styleFilterValue: any;
	public statusFilterValue: any;

	public filterDataWeight: any[] = [];
	public filterDataStyle: any[] = [];

	// autocomplete filter
	public filteredNames!: Observable<any[] | undefined>;
	public activeNameFilters: any[] = [];
	public masterReference_names: any[] = [];

	constructor(
		private alertService: AlertService,
		private dialog: MatDialog,
		private location: Location,
		private fontTypeService: FontTypeService,
		private accountService: AccountService,
		private datePipe: DatePipe
	) {

		this.weightFilterValue = new FormControl('');
		this.styleFilterValue = new FormControl('');
		this.statusFilterValue = new FormControl('');

		this.accountService.account
			.pipe(takeUntil(this._destroy$))
			.subscribe((x:any) => this.myaccount = x);

		this.fontTypeService.fontType
			.pipe(takeUntil(this._destroy$))
			.subscribe(
				(fontTypes:FontType[]) =>  {
					//console.log('collection subscription:', fontTypes);

					this.allData = fontTypes;

					if( fontTypes !== undefined && fontTypes.length > 0 ) {
						this.initialise(fontTypes);

						this.initialiseTextFilters();
					}
				}
			);
			this.fontTypeService.getAll()
			.pipe(takeUntil(this._destroy$))
			.subscribe(
				(fontTypes:FontType[]) =>  {
					this.filterDataWeight = fontTypes;
				}
			);
			this.fontTypeService.getAll()
			.pipe(takeUntil(this._destroy$))
			.subscribe(
				(fontTypes:FontType[]) =>  {
					this.filterDataStyle = fontTypes;
				}
			);

		this.onboarding();
	}

	ngOnInit() {
		this.fontTypeService.getAll()
			.pipe(first())
			.pipe(takeUntil(this._destroy$))
			.subscribe();
	}

	ngOnDestroy(): void {
		//console.warn('Font Types List ngOnDestroy');
		this._destroy$.next(false);
		this._destroy$.complete();
		//this._destroy$.unsubscribe();
		//this.ViewCollection.unsubscribe();
	}
	// filters
	private initialiseTextFilters() {

		this.masterReference_names = this.allData.map( (jk: any) => {
			return {
				'id': jk.id,
				'name': jk.name
			}
		});
		//this.masterReference_locations = _.uniq(this.masterReference_locations, y => y.location);

		this.filteredNames = this.chipCtrl.valueChanges.pipe(
			startWith(null),
			map( (so: any | null) => {
				//console.warn('this.filteredNames:', so);

				if( Number(so) ) {
					return;
				}

				return so ? this.myTextFilter('name', so) : this.masterReference_names.slice()
		}));

	}
	private myTextFilter(type:string, name: string) {
		//console.warn(email);
		switch (type) {
			case 'name':
				return this.masterReference_names.filter(so => so.name.toLowerCase().indexOf(name.toLowerCase()) === 0);
			default:
				return [];
		}
	}

	public selectedTextFilter(event: MatAutocompleteSelectedEvent, type: string): void {

		this.removeSelectedFiltered(type);

		//this.filterAlphabet = 'all';

		switch (type) {
			case 'name':

				this.sortedData = [this.allData.find(x => x.id === event.option.value)];
				this.length = this.sortedData.length;
				this.activeNameFilters = this.sortedData;
				break;
			default:
				break;
		}

	}

	public removeSelectedFiltered(type:string): void {

		switch (type) {
			case 'name':
				this.activeNameFilters.pop();
				break;
			default:
				break;
		}

		this.sortedData = this.primaryData.slice();
		this.length = this.sortedData.length;
		this.iterator();
	}

	public onFilterChange( filter:string ): void {

		let newdata: any;
		let storeData: any;

		newdata = this.allData;

		if( this.weightFilterValue.value && this.weightFilterValue.value !== undefined ) {
			newdata = newdata.filter((x:any) => {
				if(x.id === this.weightFilterValue.value)
				{
					storeData = x.fontWeight;
				}

				return x.fontWeight === storeData
			});
		}

		if( this.styleFilterValue.value && this.styleFilterValue.value !== undefined ) {
			newdata = newdata.filter((x:any) => {
				if(x.id === this.styleFilterValue.value)
				{
					storeData = x.fontStyle;
				}
				return x.fontStyle === storeData
			});
		}

		if( this.statusFilterValue.value && this.statusFilterValue.value !== undefined ) {
			newdata = newdata.filter((x:any) => {
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


	private initialise( fontTypes:FontType[]):void {

		this.primaryData = fontTypes;
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
        this.fontTypeService.updateStatus(id, params)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Record Status changed successfully', { keepAfterRouteChange: true });

                },
                error: error => {
                    this.alertService.error(error);
                    //this.loading = false;
                }
            });
	}

	public previewModel(id: string): void {
		const model = this.primaryData.find((x) => x.id === id);
		model.isPreveiw = true;

		const previewDialog = this.dialog.open( DialogPreviewComponent, {
			data: {
				title: 'Preview: ' + model.name,
				message: '',
				model: model			}
		});
		previewDialog.afterClosed().subscribe(result => {
			//console.info('Font Preview closed:', result);
			model.isPreveiw = false;

			const dynamicStyles = document.getElementById('font-preview-stylesheet');

			if( dynamicStyles ) {
				dynamicStyles.remove();
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
				this.fontTypeService.delete(id)
					.pipe(first())
					.subscribe({
						next: () => {
							model.isDeleting = false;
							this.alertService.success(  model.Name + ' Deleted successfully.', { keepAfterRouteChange: true });
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
				this.fontTypeService.restore(id)
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

	public audit( id:number ): void {

		const model = this.primaryData.find((x) => x.id === id);
		model.isVC = false;

		this.alertService.info( 'Version History still in WIP.', { keepAfterRouteChange: true });

	}

	public export(): void {

		const exportArray = this.primaryData.map( (data, index) => {
			console.log("data",data)

			return {
				'ID': data.id,
				'Name': data.name,
				'Description': data.description,
				'Font Family': data.fontFamily,
				'Weight': data.fontWeight,
				'Style': data.fontStyle,
				'Stylesheet': data.styleSheet,
				'status': (data.status === true) ? 'Active' : 'Inactive',
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
		XLSX.writeFile(wb, 'BAPP_Available_Fonts.xlsx');

	}

	private onboarding(): void {

		this.introJS.setOptions({
			showStepNumbers: true,
			showProgress: true,

			steps: [
				{
					title: 'Total Fonts.',
					element: '#hint-action-btn-create',
					intro: "Click here to create a new font."
				},
				{
					element: '#hint-action-btn-export',
					intro: "Click here to download a spreadsheet with a list of all fonts.",
				},
				{
					element: '#hint-action-btn-back',
					intro: "Click here to go back to previous page.",
				},
				{
					element: '#toggle-status',
					intro: "Click here to enable font family so it can be visible on dashboard for designing or editing a template, or disable for it to be invisible.",
				},
				{
					element: '#edit-btn',
					intro: "Click here to edit font details.",
				},
				{
					element: '#btn-preview',
					intro: "Click here to preview font.",
				},
				{
					element: '#btn-delete',
					intro: "Click here to delete font.",
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
				case 'fontFamily': return this.compare(a.fontFamily, b.fontFamily, isAsc);
				case 'fontStyle': return this.compare(a.fontStyle, b.fontStyle, isAsc);
				case 'fontWeight': return this.compare(a.fontWeight, b.fontWeight, isAsc);
				case 'status': return this.compare(a.status, b.status, isAsc);
				case 'created': return this.compare(a.created, b.created, isAsc);
				case 'updated': return this.compare(a.updated, b.updated, isAsc);
				case 'deletedAt': return this.compare(a.deletedAt, b.deletedAt, isAsc);
				case 'lastEditedBy': return this.compare(a.lastEditedBy, b.lastEditedBy, isAsc);
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

@Component({
	selector: 'app-preview-dialog',
	templateUrl: 'dialog.preview.component.html',
	styleUrls: ['dialog.preview.component.scss']
})
export class DialogPreviewComponent  implements OnInit {

	title!: string;
  	message!: string;

	constructor(
		public dialogRef: MatDialogRef<DialogPreviewComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {


	}

	ngOnInit() {
		console.log('DialogPreviewComponent:', this.data);

		const head = document.head;
		const link = document.createElement("link");

		link.type = "text/css";
		link.rel = "stylesheet";
		link.id = "font-preview-stylesheet";
		link.href = this.data.model.styleSheet;

		head.appendChild(link);
	}
}
