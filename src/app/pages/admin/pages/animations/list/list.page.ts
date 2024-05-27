import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { DatePipe, Location } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { DialogConfirmComponent, DialogRestoreComponent } from '@app/components';
import { Account, Animation, BannerSize, BannerType, Client, Template } from '@app/core/models';
import { AccountService, AlertService, AnimationService, BannerService, BannerSizeService, BannerTypeService, ClientService, ContainerService, TemplateService } from '@app/core/services';
import * as introJs from 'intro.js';
import { combineLatest, Observable, Subject } from 'rxjs';
import { first, map, startWith, takeUntil } from 'rxjs/operators';
import * as XLSX from 'xlsx';

@Component({
	templateUrl: './list.page.html',
	styleUrls: ['./list.page.scss'],
	providers: [
		DatePipe
	]
})
export class AnimationsListPage implements OnInit, OnDestroy {

	// will use the _destroy$ observable to control
	// fetching items from an observable
	private _destroy$ = new Subject<boolean>();

	private allData!: any[];
	public filterData$!:Observable<any>;
	public uiDataReady = false;
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

	// Filter
	// autocomplete
	chipCtrl = new FormControl();
	visible = true;
	selectable = true;
	removable = true;
	addOnBlur = true;
	readonly separatorKeysCodes: number[] = [ENTER, COMMA];
	@ViewChild('chipInput') chipInput!: ElementRef;

	//  select filter data
	public clientFilterValue: any;
	public templateFilterValue: any;
	public bannersizeFilterValue: any;
	public bannertypeFilterValue: any;
	public statusFilterValue: any;

	public filterDataClients: Client[] = [];
	public filterDataTemplates: Template[] = [];
	public filterDataBannerSizes: BannerSize[] = [];
	public filterDataBannerTypes: BannerType[] = [];

	// autocomplete filter
	public filteredNames!: Observable<any[] | undefined>;
	public activeNameFilters: any[] = [];
	public masterReference_names: any[] = [];

	constructor(
		private alertService: AlertService,
		private dialog: MatDialog,
		private location: Location,
		private animationService: AnimationService,
		private accountService: AccountService,
		private clientService: ClientService,
		private bannerTypeService: BannerTypeService,
		private bannerSizeService: BannerSizeService,
		private containerService: ContainerService,
		private bannerService: BannerService,
		private templateService: TemplateService,
		private datePipe: DatePipe
	) {

		this.clientFilterValue = new FormControl('');
		this.templateFilterValue = new FormControl('');
		this.bannersizeFilterValue = new FormControl('');
		this.bannertypeFilterValue = new FormControl('');
		this.statusFilterValue = new FormControl('');

		this.accountService.account
			.pipe(takeUntil(this._destroy$))
			.subscribe((x:any) => this.myaccount = x);

		this.animationService.animation
			.pipe(takeUntil(this._destroy$))
			.subscribe(
				(animations:Animation[]) =>  {
					//console.log('collection subscription:', clients);

					this.allData = animations;
					//console.log("alldata",this.allData);

					if( animations !== undefined && animations.length >= 0 ) {
						this.initialise(animations);

						this.initialiseTextFilters();
					}
				}
			);

		this.onboarding();
	}

	ngOnInit() {

		this.initialiseFilterData();

		this.animationService.getAll()
			.pipe(first())
			.pipe(takeUntil(this._destroy$))
			.subscribe();
	}

	ngOnDestroy(): void {
		//console.warn('Animations List ngOnDestroy');
		this._destroy$.next(false);
		this._destroy$.complete();
	}

	private initialise( animations:Animation[]):void {

		this.primaryData = animations;
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
        this.animationService.updateStatus(id, params)
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
				this.animationService.delete(id)
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
				this.animationService.restore(id)
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

		const exportArray = this.primaryData.map( (data) => {

			return {
				'ID': data.id,
				'Name': data.name,
				'Description': data.description,
				'Client': data.component.container.banner.template.client.name,
				'Template': data.component.container.banner.template.name,
				'Creative': data.component.container.banner.name,
				'Frame': data.component.container.name,
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
		XLSX.writeFile(wb, 'BAPP_All_Animations.xlsx');

	}

	// FILTERS
	private initialiseFilterData():void {
		this.filterData$ = combineLatest(
			[
				this.templateService.getAll(),
				this.clientService.getAll(),
				this.bannerService.getAll(),
				this.containerService.getAll(),


			]
		)
		.pipe(
			map(([templates, clients,banners,container]):any => {
				//console.info('combineLatest initialise', [templates, clients, container,banners]);
				// combineLatest returns an array of values, here we map those values to an object
				return { templates, clients,banners, container };
			})
		);

		this.filterData$.pipe(takeUntil(this._destroy$)).subscribe( (data:any) => {
			this.prepFilterData(data);
		});
	}

	private prepFilterData(data:any):void {

		this.filterDataTemplates = data.templates;

		this.filterDataClients = data.clients;
		this.filterDataBannerTypes = data.banners;
		this.filterDataBannerSizes = data.container;

		this.uiDataReady = true;

	}

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

		//console.log('selectedTextFilter['+type+']:', this.sortedData);

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

		newdata = this.allData;
		if( this.clientFilterValue.value && this.clientFilterValue.value !== undefined ) {
			newdata = newdata.filter((x:any) => {
				return x.component?.container.banner.template.clientId === this.clientFilterValue.value
			});
		}
		if( this.templateFilterValue.value && this.templateFilterValue.value !== undefined ) {
			newdata = newdata.filter((x:any) => {
				return x.component?.container.banner.template.id === this.templateFilterValue.value
			});
		}
		if( this.bannertypeFilterValue.value && this.bannertypeFilterValue.value !== undefined ) {
			newdata = newdata.filter((x:any) => {
				return x.component?.container.banner.id === this.bannertypeFilterValue.value
			});
		}
		console.log("this.bannersizeFilterValue.value",this.bannersizeFilterValue.value)
		if( this.bannersizeFilterValue.value && this.bannersizeFilterValue.value !== undefined ) {
			newdata = newdata.filter((x:any) => {

				console.log(x.component?.container.id +" === "+ this.bannersizeFilterValue.value)
				return x.component?.container.id === this.bannersizeFilterValue.value
			});
		}

		if( this.statusFilterValue.value && this.statusFilterValue.value !== undefined ) {
			newdata = newdata.filter((x:any) => {

				return x.status === this.statusFilterValue.value
			});
		}

		this.initialise(newdata);

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
				case 'client': return this.compare(a.component?.container.banner.template.client.name, b.component?.container.banner.template.client.name, isAsc);
				case 'template': return this.compare(a.component?.container.banner.template.name, b.component?.container.banner.template.name, isAsc);
				case 'creative': return this.compare(a.component?.container.banner.name, b.component?.container.banner.name, isAsc);
				case 'container': return this.compare(a.component?.container.name, b.component?.container.name, isAsc);
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
