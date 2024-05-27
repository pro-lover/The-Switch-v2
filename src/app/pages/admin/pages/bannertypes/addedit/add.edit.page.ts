import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Location } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
//import { MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Account, BannerType, Role,BannerSize ,Client, ComponentModel, Template} from '@app/core/models';
import { AccountService, AlertService,BannerSizeService, BannerTypeService, ClientService, ComponentService, TemplateService } from '@app/core/services';
import * as introJs from 'intro.js';
import { Observable, Subject } from 'rxjs';
import { first, map, startWith, takeUntil } from 'rxjs/operators';

@Component({
	templateUrl: './add.edit.page.html',
	styleUrls: ['./add.edit.page.scss'],
})
export class BannerTypesAddEditPage implements OnInit {

	// will use the _destroy$ observable to control
	// fetching items from an observable
	private _destroy$ = new Subject<boolean>();

	// MatPaginator Inputs
	public length!: number;
	public pageSize = 40;
	public currentPage = 0;
	public pageSizeOptions: number[] = [5, 10, 40, 100];

	public primaryData!: any[];
	public sortedData!: any[];

	public myaccount!: Account;

	form!: FormGroup;
	id!: string;
	isAddMode!: boolean;
	loading = false;
	submitted = false;

	Role = Role;
	client!: BannerType;
	account!: Account;

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
		private formBuilder: FormBuilder,
		private route: ActivatedRoute,
		private router: Router,
		private dialog: MatDialog,
		private location: Location,
		private accountService: AccountService,
		private clientService: ClientService,
		private bannerTypeService: BannerTypeService,
		private bannerSizeService: BannerSizeService,
		private templateService: TemplateService,
		private alertService: AlertService,
		private _snackBar: MatSnackBar
	) {
		this.clientFilterValue = new FormControl('');
		this.templateFilterValue = new FormControl('');
		this.bannersizeFilterValue = new FormControl('');
		this.bannertypeFilterValue = new FormControl('');
		this.statusFilterValue = new FormControl('');

		this.account = this.accountService.accountValue;
		this.accountService.account
			.pipe(takeUntil(this._destroy$))
			.subscribe((x:any) => this.myaccount = x);

		//this.accountService.account
		//	.pipe(takeUntil(this._destroy$))
		//	.subscribe(
		//		(bannerType:BannerType[]) =>  {
					//console.log('collection subscription:', componentModels);

			//		this.allData = bannerType;

			//		if( bannerType !== undefined && bannerType.length > 0 ) {
				//		this.initialise(bannerType);

				//		this.initialiseTextFilters();
				//	}
				//}
			//);
			this.templateService.getAll()
			.pipe(takeUntil(this._destroy$))
			.subscribe(
				(templates:Template[]) =>  {
					//console.log('templates', templates);
					this.filterDataTemplates = templates;
				}
			);

		this.bannerTypeService.getAll()
			.pipe(takeUntil(this._destroy$))
			.subscribe(
				(bannertypes:BannerType[]) =>  {
					//console.log('bannertypes', bannertypes);
					this.filterDataBannerTypes = bannertypes;
				}
			);

		this.bannerSizeService.getAll()
			.pipe(takeUntil(this._destroy$))
			.subscribe(
				(bannersizes:BannerSize[]) =>  {
					//console.log('bannersizes', bannersizes);
					this.filterDataBannerSizes = bannersizes;
				}
			);

		this.clientService.getAll()
			.pipe(takeUntil(this._destroy$))
			.subscribe(
				(clients:Client[]) =>  {
					//console.log('Clients', clients);
					this.filterDataClients = clients;
				}
			);

		this.onboarding();
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

		//console.warn('onFilterChange:', filter, this.clientFilterValue.value, this.templateFilterValue.value, this.bannersizeFilterValue.value, this.bannertypeFilterValue.value, this.statusFilterValue.value);

		newdata = this.allData;

		if( this.clientFilterValue.value && this.clientFilterValue.value !== undefined ) {
			newdata = newdata.filter((x:any) => {
				return x.container.banner.template.clientId === this.clientFilterValue.value
			});
		}

		if( this.templateFilterValue.value && this.templateFilterValue.value !== undefined ) {
			newdata = newdata.filter((x:any) => {
				return x.container.banner.templateId === this.templateFilterValue.value
			});
		}

		if( this.bannertypeFilterValue.value && this.bannertypeFilterValue.value !== undefined ) {
			newdata = newdata.filter((x:any) => {
				return x.container.banner.bannertypeId === this.bannertypeFilterValue.value
			});
		}

		if( this.bannersizeFilterValue.value && this.bannersizeFilterValue.value !== undefined ) {
			newdata = newdata.filter((x:any) => {
				return x.container.banner.bannersizeId === this.bannersizeFilterValue.value
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

	private initialise( componentModels:ComponentModel[]):void {

		this.primaryData = componentModels;
		this.sortedData = this.primaryData.slice();

		this.length = this.sortedData.length;

		this.iterator();

	}
	// convenience getter for easy access to form fields
	get f() { return this.form.controls; }

	ngOnInit() {
		this.id = this.route.snapshot.params['id'];
		this.isAddMode = !this.id;

		this.form = this.formBuilder.group({
			name: ['', Validators.required],
			description: ['', Validators.required]
		});

		if (!this.isAddMode) {
			this.bannerTypeService.getById(this.id)
				.pipe(first())
				.subscribe( (x) => {
					this.form.patchValue(x);
				});
		}
	}

	onSubmit() {
		this.submitted = true;

		// reset alerts on submit
		this.alertService.clear();

		// stop here if form is invalid
		if (this.form.invalid) {
			return;
		}

		this.loading = true;
		if (this.isAddMode) {
			this.createRecord();
		} else {
			this.updateRecord();
		}
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
					title: 'Add Creative Type',
					element: '#btn-back',
					intro: "Click here to go back to previous page."
				},
				{
					element: '#inputName',
					intro: "Enter a name for your creative type.",
				},
				{
					element: '#inputDesc',
					intro: "Enter a description for your creative type.",
				},
				{
					element: '#btn-save',
					intro: "Click here to save new creative type.",
				},
				{
					element: '#btn-cancel',
					intro: "Click here to cancel creating a new creative type.",
				},
			]
		});
	}

	public help(): void {

		//this.introJS.refresh();

		//this.introJS.addHints();

		//this.introJS.showHints();

		this.introJS.start();
	}

	private createRecord() {
        this.bannerTypeService.create(this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Record created successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
	}

	private updateRecord() {
        this.bannerTypeService.update(this.id, this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Update successful', { keepAfterRouteChange: true });
                    this.router.navigate(['../../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
	}
	private iterator(): void {
		const end = (this.currentPage + 1) * this.pageSize;
		const start = this.currentPage * this.pageSize;
		const part = this.primaryData.slice(start, end);
		this.sortedData = part;
	}

}
