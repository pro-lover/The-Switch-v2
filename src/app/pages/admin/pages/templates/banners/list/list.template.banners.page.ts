import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { DatePipe, Location } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
//import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { ActivatedRoute } from '@angular/router';
import { BottomSheetTemplateRulesComponent, DialogConfirmComponent, DialogRestoreComponent } from '@app/components';
import { Account, BannerSize, BannerType, Client, Template } from '@app/core/models';
import { AccountService, AlertService, BannerService, BannerSizeService, BannerTypeService, ClientService, ComponentService, ContainerService, TemplateService } from '@app/core/services';
import { combineLatest, forkJoin, Observable, Subject } from 'rxjs';
import { first, last, map, startWith, takeUntil } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { DialogBannerDuplicateComponent } from './dialog.form.duplicate.banner.component';
import { DialogBannerEditComponent } from './dialog.form.edit.banner.component';

@Component({
	templateUrl: './list.template.banners.page.html',
	styleUrls: ['./list.template.banners.page.scss'],
	providers: [
		DatePipe
	]
})
export class TemplateBannersListPage implements OnInit, OnDestroy {

	// will use the _destroy$ observable to control
	// fetching items from an observable
	private _destroy$ = new Subject<boolean>();

	// data for sortedData pagination
	public primaryData!: any[];
	// pagination data
	public sortedData!: any[];
	// master reference data for filters
	private allData!: any[];

	public filterData$!:Observable<any>;
	public uiDataReady = false;

	public myaccount!: Account;

	id!: string;
	public clientName!:string;
	public templateName!:string;

	// MatPaginator Inputs
	public length!: number;
	public pageSize = 10;
	public currentPage = 0;
	public pageSizeOptions: number[] = [5, 10, 40, 100];

	// MatPaginator Output
	public pageEvent!: PageEvent;


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
		private _bottomSheet: MatBottomSheet,
		private accountService: AccountService,
		private bannerService: BannerService,
		private containerService: ContainerService,
		private componentService: ComponentService,
		private clientService: ClientService,
		private bannerTypeService: BannerTypeService,
		private bannerSizeService: BannerSizeService,
		private templateService: TemplateService,
		private route: ActivatedRoute,
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

	}

	ngOnInit() {
		this.id = this.route.snapshot.params['id'];

		//console.log('Template ID:', this.id);

		this.initialiseFilterData();

		this.initialise();
	}

	ngOnDestroy(): void {
		//console.warn('Template Banners List ngOnDestroy');
		this._destroy$.next(false);
		this._destroy$.complete();
	}

	private initialise():void {

		this.bannerService.getTemplateBannersById(this.id)
			.pipe(first())
			.pipe(takeUntil(this._destroy$))
			.subscribe((banners:any) => {

				console.log('Template Banners:', banners);

				this.primaryData = banners;
				this.allData = banners;

				this.clientName = this.allData[0].template.client.name;
				this.templateName = this.allData[0].template.name;

				this.intialisePagination();

				this.initialiseTextFilters();
			});
	}

	// filters
	private initialiseFilterData():void {
		this.filterData$ = combineLatest(
			[
				//this.templateService.getAll(),
				this.bannerTypeService.getAll(),
				this.bannerSizeService.getAll()
				//this.clientService.getAll()
			]
		)
		.pipe(
			map(([bannerTypes, bannerSizes]):any => {
				//console.info('combineLatest initialise', [bannerTypes, bannerSizes]);
				// combineLatest returns an array of values, here we map those values to an object
				return { bannerTypes, bannerSizes };
			})
		);

		this.filterData$.pipe(takeUntil(this._destroy$)).subscribe( (data:any) => {
			this.prepFilterData(data);
		});
	}

	private prepFilterData(data:any):void {

		//console.info('prepFilterData', data);

		//this.filterDataTemplates = data.templates;
		//this.filterDataClients = data.clients;
		this.filterDataBannerTypes = data.bannerTypes;
		this.filterDataBannerSizes = data.bannerSizes;

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
				//console.warn('this.filteredNames:', so, this.masterReference_names);

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

		// use form patch value
		// show meta data table when editing
		//this.clientFilterValue.value = '';
		//this.templateFilterValue.value = '';
		///this.bannersizeFilterValue.value = '';
		//this.bannertypeFilterValue.value = '';

		//console.warn('this.allData:', this.allData );
		//console.warn('onFilterChange:', filter, this.bannersizeFilterValue.value, this.bannertypeFilterValue.value, this.statusFilterValue.value);

		newdata = this.allData;

		if( this.bannertypeFilterValue.value && this.bannertypeFilterValue.value !== undefined ) {
			newdata = newdata.filter((x:any) => {
				return x.bannertypeId === this.bannertypeFilterValue.value
			});
		}

		if( this.bannersizeFilterValue.value && this.bannersizeFilterValue.value !== undefined ) {
			newdata = newdata.filter((x:any) => {
				return x.bannersizeId === this.bannersizeFilterValue.value
			});
		}

		if( this.statusFilterValue.value && this.statusFilterValue.value !== undefined ) {
			newdata = newdata.filter((x:any) => {
				return x.status === this.statusFilterValue.value
			});
		}

		//console.log('newData:', newdata);
		//this.initialise();
		//this.initialise(newdata);

		this.primaryData = newdata;
		this.intialisePagination();

	}

	public toggleStatus(event:any, id: string):void {

		/**/
		this.updateStatus(id, {
			status: event.checked
		});
		/**/
	}

	private updateStatus( id: string, params: any ):void {
		this.bannerService.updateStatus(id, params)
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
				this.bannerService.delete(id)
					.pipe(first())
					.subscribe({
						next: () => {
							this.alertService.success(  model.name + ' deleted successfully.', { keepAfterRouteChange: true });
							model.isDeleting = false;
							//this.primaryData = this.primaryData.filter(x => x.id !== id);
							this.primaryData.find((x) => {
								if( x.id === id ) {
									x.deletedAt = new Date();
									x.status = false;
									//console.log('update model', this.primaryData);
									this.intialisePagination();
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
				this.bannerService.restore(id)
					.pipe(first())
					.subscribe({
						next: (newmodel) => {
							this.alertService.success(  model.name + ' Restored successfully.', { keepAfterRouteChange: true });
							model.isDeleting = false;

							this.primaryData.find((x) => {
								if( x.id === id ) {
									x.deletedAt = null;
									x.status = true;
									//console.log('update model', this.primaryData);
									this.intialisePagination();
								}
							});

							//this.intialisePagination();
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

	public edit( id:string ): void {

		const model = this.primaryData.find((x) => x.id === id);
		model.isVC = true;

		const editDialog = this.dialog.open( DialogBannerEditComponent, {
			data: {
				title: 'Editing Creative ' + model.name,
				data: model
			}
		});
		editDialog.afterClosed().subscribe(result => {

			if (result === false) {

				//console.info('Cancel Editing Model ID:', id);
				model.isVC = false;
				this.alertService.info(  model.name + ' not changed.', { keepAfterRouteChange: true });

			} else {

				//console.info('Editing Model ID:', id, result);

				//model.isVC = false;
				/**/
				this.bannerService.update(id, result)
					.pipe(first())
					.subscribe({
						next: (updatedModel) => {
							model.isVC = false;
							this.alertService.success(  model.name + ' updated successfully.', { keepAfterRouteChange: true });

							this.primaryData = this.primaryData.map((x) => {
								if( x.id === updatedModel.id ) {
									x = updatedModel;
									//console.log('New Model', updatedModel)
								}

								return x;
							});

							this.intialisePagination();
						},
						error: (error:string) => {
							this.alertService.error(error);
							model.isVC = false;
						}
					});
				/**/

			}
		});

	}

	public duplicate( id:string ): void {

		const model = this.primaryData.find((x) => x.id === id);
		model.isVC = true;

		const duplicateDialog = this.dialog.open( DialogBannerDuplicateComponent, {
			data: {
				title: 'Duplicate Creative ' + model.name,
				data: model
			}
		});
		duplicateDialog.afterClosed().subscribe(result => {

			if (result === false) {

				//console.info('Cancel Editing Model ID:', id);
				model.isVC = false;
				this.alertService.info(  model.name + ' not duplicated.', { keepAfterRouteChange: true });

			} else {

				//console.info('Duplicating Model ID:', id, result);

				//model.isVC = false;
				//return

				/**/
				this.bannerService.create(result)
					.pipe(first())
					.subscribe({
						next: (newModel) => {

							this.createDuplicatedContainers(model, newModel);

						},
						error: (error:string) => {
							this.alertService.error(error);
							model.isVC = false;
						}
					});
				/**/

			}
		});

	}

	private createDuplicatedContainers(referenceModel:any, newModel: any) {

		const containerCreatePromises = [];

		for (let index = 0; index < referenceModel.containers.length; index++) {
			const referenceModelContainer = referenceModel.containers[index];

			containerCreatePromises.push(
				this.containerService.create({
					name: referenceModelContainer.name,
					description: referenceModelContainer.description,
					bannerId: newModel.id
				})
			);
		}

		forkJoin(containerCreatePromises)
			.pipe(last())
			.subscribe({
				next: ( newContainers:any[] ) => {

					// go through all components and update the containerId
					const newContainerComponentsPromises:any[] = [];

					for (let index = 0; index < newContainers.length; index++) {
						const newContainer = newContainers[index];
						const referenceModelContainer = referenceModel.containers[index];

						referenceModelContainer.components.forEach((component:any) => {
							newContainerComponentsPromises.push(
								this.componentService.create(
									{
										name: component.name,
										description: component.description,
										smart: component.smart,
										status: component.status,
										componenttypeId: component.componenttypeId,
										containerId: newContainer.id,
										// https://stackoverflow.com/questions/61297000/convert-array-of-objects-to-object-of-key-value-pairs
										componentmeta: component.componentmeta.reduce((r:any,{name,value}:any) => (r[name]=value,r), {})
									}
								)
							)
						});

					}

					forkJoin(newContainerComponentsPromises)
						.pipe(last())
						.subscribe({
							next: ( newComponents:any[] ) => {
								referenceModel.isVC = false;
								//console.log('New Components', newComponents);
								this.alertService.success('Creative duplicated successfully. Please update the image assets of the new creative.', { keepAfterRouteChange: true });

								if( newModel.templateId === referenceModel.templateId ) {
									this.primaryData.push(newModel);
									this.intialisePagination();
								}
							},
							error: error => {
								referenceModel.isVC = false;
								this.alertService.error(error);

							}
						});

				},
				error: error => {
					referenceModel.isVC = false;
					this.alertService.error(error);
				}
			});

	}

	public viewRules( id:string ): void {

		const model = this.primaryData.find((x) => x.id === id);
		//model.isVC = true;

		const tempRules = this.bannerService.generateBannerComponentRules(model.containers[0].components);

		//console.log('creativeRules:', tempRules );

		this._bottomSheet.open(
			BottomSheetTemplateRulesComponent,
			{
				data: tempRules
			}
		);

	}

	public audit( id:number ): void {

		const model = this.primaryData.find((x) => x.id === id);
		model.isVC = false;

		this.alertService.info( 'Version History still in WIP.', { keepAfterRouteChange: true });

	}

	public back(): void {
		this.location.back();
	}

	public export(): void {

		const exportArray = this.primaryData.map( (data, index) => {

			return {
				'ID': data.id,
				'Name': data.name,
				'Description': data.description,
				'Client': data.template.client.name,
				'Creative Dimensions': data.bannersize.name,
				'Creative Type': data.bannertype.name,
				'No. of Frames': data.containers.length,
				'status': (data.status === true) ? 'Active' : 'Inactive',
				'created': this.datePipe.transform(data.created, 'yyyy-MM-dd HH:mm:ss'),
				'updated': this.datePipe.transform(data.updated, 'yyyy-MM-dd HH:mm:ss'),
				'deletedAt': this.datePipe.transform(data.deletedAt, 'yyyy-MM-dd HH:mm:ss')
			}

		});

		const TemplateName = this.primaryData[0].template.name;

		/* generate worksheet */
		const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportArray);

		/* generate workbook and add the worksheet */
		const wb: XLSX.WorkBook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, TemplateName + ' Creatives' );

		/* save to file */
		XLSX.writeFile(wb, 'BAPP_Template-' + TemplateName + '-Creatives.xlsx');

	}

	public help(): void {

		//this.introJS.refresh();

		//this.introJS.addHints();

		//this.introJS.showHints();

		//this.introJS.start();
		this.alertService.info( 'Help/Onboarding Feature still in WIP.', { keepAfterRouteChange: true });
	}

	// PAGINATION FUNCS
	private intialisePagination() {
		this.sortedData = this.primaryData.slice();

		this.length = this.sortedData.length;

		this.iterator();
	}
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
				case 'client': return this.compare(a.template.client.name, b.template.client.name, isAsc);
				case 'bannersize': return this.compare(a.bannersize.name, b.bannersize.name, isAsc);
				case 'bannertype': return this.compare(a.bannertype.name, b.bannertype.name, isAsc);
				case 'containers': return this.compare(a.containers.length, b.containers.length, isAsc);
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
