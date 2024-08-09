import { BreakpointObserver } from '@angular/cdk/layout';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Account, BannerSize, BannerType, Client, ComponentType, Role, Template } from '@app/core/models';
import { AccountService, AlertService, BannerService, BannerSizeService, BannerTypeService, ClientService, ComponentTypeService, ContainerService, TemplateService } from '@app/core/services';
import * as introJs from 'intro.js';
import { forkJoin } from 'rxjs';
import { first, last } from 'rxjs/operators';

export interface TemplateTemp {
	name: string;
	description: string;
	status: boolean;
	clientId: number;
	bannertypeId: number;
	banners: any[];
}

@Component({
	templateUrl: './add.edit.page.html',
	styleUrls: ['./add.edit.page.scss'],
	providers: [
		{
			provide: STEPPER_GLOBAL_OPTIONS,
			useValue: { showError: true },
		},
	],
})
export class TemplatesAddEditPage implements OnInit {

	// @TODO: Keep track of added components and only allow one type of component name per banner size
	//

	//user onboarding
	private introJS = introJs();

	public isLinear = true;
	public panelOpenState = true;

	id!: string;
	isAddMode!: boolean;
	loading = false;
	submitted = false;

	Role = Role;

	formDataClients!: Client[];
	formDataBannerSizes!: BannerSize[];
	formDataBannerTypes!: BannerType[];
	formDataComponentType!: any[];//ComponentType[];

	public TemplateSave!: TemplateTemp;

	public activeBannerSizes: any[] = [];
	public activeBannerComponents: any[] = [];
	public activeBannerContainers: any[] = [];
	public activeBannerComponentsz: any[] = [];

	client!: Client;
	template!: Template;
	account!: Account;

	public FormGroupTemplateDetails!: FormGroup;

	public componentMetaFiles: any[] = [];

	/* Responsive steper listener */
	//stepperOrientation: Observable<StepperOrientation>;

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
		private componentTypeService: ComponentTypeService,
		private templateService: TemplateService,
		private containerService: ContainerService,
		private bannerService: BannerService,
		private alertService: AlertService,
		public breakpointObserver: BreakpointObserver
	) {

		this.account = this.accountService.accountValue;
		this.onboarding();

	}

	// convenience getter for easy access to form fields
	get ftemplatedetails() { return this.FormGroupTemplateDetails.controls; }

	ngOnInit() {

		this.intialiseAllData();

		this.id = this.route.snapshot.params['id'];
		this.isAddMode = !this.id;

		this.FormGroupTemplateDetails = this.formBuilder.group({
			name: ['', Validators.required],
			description: ['', Validators.required],
			clientId: ['', Validators.required],
			bannertypeId: ['', Validators.required],
			bannerSizeId: ['', Validators.required],
			containerNumber: ['', Validators.required],
		});

		this.ftemplatedetails['bannertypeId'].valueChanges.subscribe((value) => {
			////console.log('Selected Banner Type:', value, this.ftemplatedetails['containerNumber']);
			this.ftemplatedetails['containerNumber'].setValue(1);
		});

		this.ftemplatedetails['bannerSizeId'].valueChanges.subscribe((value) => {
			this.activeBannerSizes = [];
			value.map((x: any) => {
				if (this.activeBannerSizes.filter(y => y.id === x).length > 0) {
					//this.activeBannerSizes = this.activeBannerSizes.filter(y=> y.id !== x);
				} else {
					this.activeBannerSizes.push(this.formDataBannerSizes.find(y => y.id === x));
				}
			});
		});

		if (!this.isAddMode) {
			////console.log('Editing Template:', this.id);
			this.intialiseEditData();

		}

	}

	private intialiseAllData() {
		this.clientService.getAll()
			.pipe(first())
			.subscribe((x: Client[]) => {
				this.formDataClients = x;
			});

		this.bannerTypeService.getAll()
			.pipe(first())
			.subscribe((x: BannerType[]) => {
				this.formDataBannerTypes = x;
			});

		this.bannerSizeService.getAll()
			.pipe(first())
			.subscribe((x: BannerSize[]) => {
				this.formDataBannerSizes = x;
			});

		this.componentTypeService.getAll()
			.pipe(first())
			.subscribe((x: ComponentType[]) => {
				this.formDataComponentType = x;
			});
	}

	private intialiseEditData() {

		this.templateService.getById(this.id)
			.pipe(first())
			.subscribe((x: any) => {


				////console.log('Editing Template:', x);
				this.template = x;

				this.FormGroupTemplateDetails.patchValue(x);
				x.banners.map((x: any) => {
					this.activeBannerSizes.push(this.formDataBannerSizes.find(y => y.id === x.bannersizeId));
				});
				this.ftemplatedetails['bannerSizeId'].setValue(this.activeBannerSizes.map((x: any) => x.id));
				this.ftemplatedetails['containerNumber'].setValue(1);
			});
	}

	private prepTemplatedb() {

		// config all activeBannersizes
		/**/
		this.activeBannerSizes.map((x: any) => {
			x.status = true;
			x.bannertypeId = this.FormGroupTemplateDetails.value['bannertypeId'];
			x.containers = []; //Array(this.FormGroupTemplateBanners.value['containerNumber']);
			/**/
			for (let index = 0; index < this.FormGroupTemplateDetails.value['containerNumber']; index++) {

				// need banner size ids to match components with bannersize
				x.containers.push({
					name: x.name + ' Frame ' + (index + 1),
					description: x.name + ' Frame ' + (index + 1),
					//components: this.componentMetaFiles.filter(y => y.bannerSizeId === x.id),
				});
			}
			/**/
		});
		/**/

		// config all componentMetaFiles
		//console.warn('componentMetaFiles:', this.componentMetaFiles);
		//console.warn('activeBannerSizes:', this.activeBannerSizes);

		this.TemplateSave = {
			bannertypeId: this.FormGroupTemplateDetails.value['bannertypeId'],
			clientId: this.FormGroupTemplateDetails.value['clientId'],
			description: this.FormGroupTemplateDetails.value['description'],
			name: this.FormGroupTemplateDetails.value['name'],
			status: true,
			banners: this.activeBannerSizes
		}
	}

	public onSubmit() {
		this.submitted = true;

		// stop here if form is invalid
		if (this.FormGroupTemplateDetails.invalid) {

			this.alertService.error('Please en sure you\'ve completed all the required fields correctly.');

			this.submitted = false;
			return;
		}

		// reset alerts on submit
		this.alertService.clear();

		this.prepTemplatedb();

		if (this.isAddMode) {
			this.createRecord();
		} else {
			this.updateRecord();
		}

	}

	private createRecord() {

		this.loading = true;

		//console.warn('Creating Record:', this.TemplateSave);

		// create template

		//return;

		this.templateService.create(this.TemplateSave)
			.pipe(first())
			.subscribe({
				next: (templateObj: any) => {

					//this.alertService.success('Template created successfully', { keepAfterRouteChange: true });

					const bannerCreatePromises = [];

					/**/
					// create banners
					for (let index = 0; index < this.TemplateSave.banners.length; index++) {
						const element = this.TemplateSave.banners[index];

						bannerCreatePromises.push(
							this.bannerService.create({
								bannersizeId: element.id,
								bannertypeId: this.TemplateSave.bannertypeId,
								name: element.name,
								description: element.description,
								templateId: templateObj.id
							})
						);

					}

					forkJoin(bannerCreatePromises)
						.pipe(last())
						.subscribe({
							next: (bannersObj: any[]) => {

								//this.alertService.success('Template Banners Created Successfully', { keepAfterRouteChange: true });

								// create containers for each saved banner

								const containerCreatePromises = [];

								for (let index = 0; index < bannersObj.length; index++) {
									const savedBanner = bannersObj[index];

									for (let index = 0; index < this.FormGroupTemplateDetails.value['containerNumber']; index++) {
										//const element = combinedFormValues.researchers[index];

										containerCreatePromises.push(
											this.containerService.create({
												name: savedBanner.name + ' Frame ' + (index + 1),
												description: savedBanner.description + ' Frame ' + (index + 1),
												bannerId: savedBanner.id
											})
										);

									}
								}

								forkJoin(containerCreatePromises)
									.pipe(last())
									.subscribe({
										next: (containersObj: any[]) => {

											this.alertService.success('Template Created Successfully', { keepAfterRouteChange: true });

											this.router.navigate(['../'], { relativeTo: this.route });

											this.loading = false;

										},
										error: error => {
											this.alertService.error(error);
											this.loading = false;
										}
									});

							},
							error: error => {
								this.alertService.error(error);
								this.loading = false;
							}
						});

				},
				error: error => {
					this.alertService.error(error);
					this.loading = false;
				}
			});
	}

	private updateRecord() {
		this.loading = true;

		////console.log('Updating Record:', this.TemplateSave, this.template );

		const newBanners = this.getDifference(this.TemplateSave.banners, this.template.banners);
		const removedBanners = this.getDifference(this.template.banners, this.TemplateSave.banners);

		console.warn('New Banners:', newBanners);
		console.warn('Removed Banners:', removedBanners);

		//return;

		this.templateService.update(this.id, this.TemplateSave)
			.pipe(first())
			.subscribe({
				next: (templateObj: any) => {

					// create banners
					if (newBanners.length > 0) {
						const bannerCreatePromises = [];
						for (let index = 0; index < newBanners.length; index++) {
							const element = newBanners[index];

							bannerCreatePromises.push(
								this.bannerService.create({
									bannersizeId: element.id,
									bannertypeId: this.template.bannertypeId,
									name: element.name,
									description: element.description,
									templateId: this.template.id
								})
							);

						}

						forkJoin(bannerCreatePromises)
							.pipe(last())
							.subscribe({
								next: (bannersObj: any[]) => {

									//this.alertService.success('Template Banners Created Successfully', { keepAfterRouteChange: true });

									// create containers for each saved banner
									const containerCreatePromises = [];

									for (let index = 0; index < bannersObj.length; index++) {
										const savedBanner = bannersObj[index];

										for (let index = 0; index < this.FormGroupTemplateDetails.value['containerNumber']; index++) {
											//const element = combinedFormValues.researchers[index];

											containerCreatePromises.push(
												this.containerService.create({
													name: savedBanner.name + ' Frame ' + (index + 1),
													description: savedBanner.description + ' Frame ' + (index + 1),
													bannerId: savedBanner.id
												})
											);

										}
									}

									forkJoin(containerCreatePromises)
										.pipe(last())
										.subscribe({
											next: (containersObj: any[]) => {

												this.alertService.success('Template Created Successfully', { keepAfterRouteChange: true });

												//this.router.navigate(['../../'], { relativeTo: this.route });

												this.loading = false;

												this.intialiseEditData();

											},
											error: error => {
												this.alertService.error(error);
												this.loading = false;
											}
										});

								},
								error: error => {
									this.alertService.error(error);
									this.loading = false;
								}
							});

					} else {
						this.alertService.success('Update successful', { keepAfterRouteChange: true });
						//this.router.navigate(['../../'], { relativeTo: this.route });
						this.loading = false;
					}

					// delete removed banners
					if (removedBanners.length > 0) {
						const bannerDeletePromises = [];
						for (let index = 0; index < removedBanners.length; index++) {
							const element = removedBanners[index];

							bannerDeletePromises.push(
								this.bannerService.delete(element.id)
							);

						}

						forkJoin(bannerDeletePromises)
							.pipe(last())
							.subscribe({
								next: (bannersObj: any[]) => {

									this.alertService.success('Template Banners Removed Successfully', { keepAfterRouteChange: true });

									this.intialiseEditData();

								},
								error: error => {
									this.alertService.error(error);
									this.loading = false;
								}
							});
					}

					//
					//this.alertService.success('Update successful', { keepAfterRouteChange: true });
					//this.router.navigate(['../../'], { relativeTo: this.route });
					//this.loading = false;
				},
				error: error => {
					this.alertService.error(error);
					this.loading = false;
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

			steps: [
				{
					title: 'Create a new template',
					element: '#client-drp',
					intro: "Click here to select a client."
				},
				{
					element: '#creative-drp',
					intro: "Click here to select a creative type."
				},
				{
					element: '#inpt-tempName',
					intro: "Enter a name for your template."
				},
				{
					element: '#input-tempDesc',
					intro: "Enter a description for your template."
				},
				{
					element: '#size-drp',
					intro: "Click here to select banner size(s)."
				},
				{
					element: '#inputContNo',
					intro: "Enter number of container(s) you want to create."
				},
				{
					element: '#btn-save',
					intro: "Click here to save new template."
				},
				{
					element: '#btn-cancel',
					intro: "Click here cancel creation of new template."
				},
			],
			/**/
		});
	}

	public help(): void {

		//this.introJS.refresh();

		//this.introJS.addHints();

		//this.introJS.showHints();

		this.introJS.start();

		/*this._snackBar.open( 'Help/Onboarding Feature still in WIP.', 'close', {
			horizontalPosition: 'center',
			verticalPosition: 'top',
		});*/
	}


	// Get Difference between two Arrays of Objects
	private getDifference(array1: any, array2: any) {
		return array1.filter((object1: any) => {
			return !array2.some((object2: any) => {
				return object1.name === object2.name;
			});
		});
	}

}
