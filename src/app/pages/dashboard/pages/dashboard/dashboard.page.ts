import { BreakpointObserver } from '@angular/cdk/layout';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Location } from '@angular/common';
import { Component, EventEmitter, Inject, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatAccordion } from '@angular/material/expansion';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { StepperOrientation } from '@angular/material/stepper';
import { Banner, BannerSize, BannerType, Client, FontType, Project, Template } from '@app/core/models';
import { AlertService, BannerCreatorService, BannerService, BannerSizeService, BannerTypeService, ClientService, FontTypeService, ProjectService, TemplateService, WebWorkerService } from '@app/core/services';
import { generateUUID, getCartesianProduct, groupBy, urlContentToDataUri } from '@core/utils/helper.utils';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import { environment } from '@env/environment';
import * as saveAs from 'file-saver';
import * as introJs from 'intro.js';
import * as JSZip from 'jszip';
import { BehaviorSubject, combineLatest, Observable, Subject, Subscription } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';

const GIF = (window as any).GIF;

@Component({
	selector: 'app-dashboard',
	templateUrl: './dashboard.page.html',
	styleUrls: ['./dashboard.page.scss'],
	providers: [
		{
			provide: STEPPER_GLOBAL_OPTIONS,
			useValue: {
				showError: true,
				displayDefaultIndicatorType: false
			}
		},
	]
})
export class DashboardPage implements OnInit, OnDestroy {

	@ViewChild(MatAccordion) accordion!: MatAccordion;

	// will use the _destroy$ observable to control
	// fetching items from an observable
	private _destroy$ = new Subject<boolean>();

	public path = ROUTER_UTILS.config.base;

	//user onboarding
	private introJS = introJs();

	// UI Variables
	public isLinear = true;
	public panelOpenState = false;

	public generatingDownloads = false;
	public noOfVariations = 0;
	//public noOfVariationsForGeneration = 0;
	public variationsGenerated = false;
	public variationsExported = false;
	public exportingProcess = false;

	public percentage = 0;
	public completedBannerVariationCounter = 0;
	public TotalContainersForAllCreatives = 0;

	public newVariationNameValue!:FormControl;

	private variationsTracker:any[] = [];

	/* Responsive steper listener */
	stepperOrientation: Observable<StepperOrientation>;

	// FORM DATA
	public dashboardData$!:Observable<any>;
	public uiDataReady = false;
	public BannerSizes!: BannerSize[];
	public BannerTypes!: BannerType[];
	public Clients!: Client[];
	public Projects!: Project[];
	public Templates!: Template[];

	private selectedClient?: Subscription;
	private selectedProject?: Subscription;
	private selectedCreativeType?: Subscription;
	private selectedProjectTemplate?: Subscription;
	private selectedProjectTemplateBanners?: Subscription;

	// Template Rules
	public TemplateRules: any[] = [];

	// Active Data for Step 1 Form Fields
	public FormGroupProjectDetails!: FormGroup;

	public activeBannerSizes: any[] = [];
	public activeTemplate!: any;
	public availableProjects: Project[] = [];
	public availableCreativeTypes: BannerType[] = [];
	public availableTemplates: Template[] = [];
	public availableBanners: Banner[] = [];

	public creativeType!: string | undefined;

	public updateableComponents:any[] = [];

	// Data for Step 2
	public FormGroupVariations!:FormControl;

	@Output() variationsEvent = new EventEmitter<any>();
	@Output() downloadVariationsEvent = new EventEmitter<any>();

	@Input() variationCollectionForDownload!: any[];
	public variationCollectionForExport: any[] = [];

	// Filters
	private filteredData!: any[];
	public bannersizeFilterValue: any;
	//public filterDataBannerSizes: BannerSize[] = [];

	/**/
	// MatPaginator Inputs for variations pagination
	public pageLength = 0;
	public pageSize = 20;
	public currentPage = 0;
	public pageSizeOptions: number[] = [10, 20, 50, 100];
	public sortedData!: any[];
	public numberOfVer!: any[];

	// MatPaginator Output
	public pageEvent!: PageEvent;
	/**/

	// creative rendered and ready
	private creativeReadySubject: BehaviorSubject<boolean | any>;
	public creativeReadyObs: Observable<boolean | any>;

	//refresh stage
	private refreshStageSubject: BehaviorSubject<boolean>;
	public refreshStageObs: Observable<boolean>;

	//reset uploads
	private resetVariationsSubject: BehaviorSubject<any>;
	public resetVariationsObs: Observable<any>;

	//remove upload
	private removeUploadItemSubject: BehaviorSubject<any>;
	public removeUploadItemObs: Observable<any>;

	//Download GIF/HTML5
	private generateSubject: BehaviorSubject<boolean>;
	public generateObs: Observable<boolean>;

	// HTML5 animations playback controls
	public animation_isPlaying = false;
	public animation_isLooping = false;
	private playStageAnimationSubject: BehaviorSubject<any>;
	public playStageAnimationObs: Observable<any>;

	private playGlobalAnimationSubject: BehaviorSubject<boolean|null>;
	public playGlobalAnimationObs: Observable<boolean|null>;

	//loop stage animation
	private loopStageAnimationSubject: BehaviorSubject<boolean>;
	public loopStageAnimationObs: Observable<boolean>;

	// Data
	public files: any[] = [];
	private uploadedFileSubject: BehaviorSubject<any[] | unknown>;
	public uploadedFileObs: Observable<any[] | unknown>;

	constructor(
		private dialog: MatDialog,
		private location: Location,
		private clientService: ClientService,
		private bannerService: BannerService,
		private bannerTypeService: BannerTypeService,
		private bannerSizeService: BannerSizeService,
		private projectService: ProjectService,
		private alertService: AlertService,
		private _formBuilder: FormBuilder,
		private templateService: TemplateService,
		public breakpointObserver: BreakpointObserver,
		private bannerCreatorService: BannerCreatorService,
		private fontTypeService: FontTypeService,
		private webWorkerService: WebWorkerService
	) {

		// Step 3 Filters
		this.bannersizeFilterValue = new FormControl('');

		this.buildForm();

		this.uploadedFileSubject = new BehaviorSubject<any[] | unknown>(null);
		this.uploadedFileObs = this.uploadedFileSubject.asObservable();

		this.refreshStageSubject = new BehaviorSubject<boolean>(false);
		this.refreshStageObs = this.refreshStageSubject.asObservable();

		this.generateSubject = new BehaviorSubject<boolean>(false);
		this.generateObs = this.generateSubject.asObservable();

		this.resetVariationsSubject = new BehaviorSubject<boolean>(false);
		this.resetVariationsObs = this.resetVariationsSubject.asObservable();

		this.removeUploadItemSubject = new BehaviorSubject<boolean>(false);
		this.removeUploadItemObs = this.removeUploadItemSubject.asObservable();

		this.creativeReadySubject = new BehaviorSubject<boolean>(false);
		this.creativeReadyObs = this.creativeReadySubject.asObservable();

		// animations
		this.playStageAnimationSubject = new BehaviorSubject<any>(null);
		this.playStageAnimationObs = this.playStageAnimationSubject.asObservable();

		this.playGlobalAnimationSubject = new BehaviorSubject<boolean|null>(null);
		this.playGlobalAnimationObs = this.playGlobalAnimationSubject.asObservable();

		this.loopStageAnimationSubject = new BehaviorSubject<boolean>(false);
		this.loopStageAnimationObs = this.loopStageAnimationSubject.asObservable();

		this.stepperOrientation = breakpointObserver
			.observe('(min-width: 800px)')
			.pipe(
				map(({matches}) => (matches ? 'horizontal' : 'vertical')),
				takeUntil(this._destroy$)
			);

			//this.webWorkerService.downloadAllVariations(['test']);
	}

	// convenience getter for easy access to form fields
	get f() { return this.FormGroupProjectDetails.controls; }

	ngOnInit() {

		this.initialise();

		// Listen to Form Control Value Changes to dynamically populate available options
		// based on user inputs

		this.selectedClient = this.f['projectClient'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {

			if( value === undefined || value === '' || value === null ) {
				this.f['projectTitle'].disable();
				this.f['projectBannerType'].disable();

				//this.f['projectTitle'].setValue('');
				this.f['projectTitle'].patchValue('');
				//this.f['projectBannerType'].patchValue('');
				//this.f['projectBannerSizes'].patchValue(false);

				//this.BannerSizes = [];
				//this.TemplateRules = [];
				//this.activeBannerSizes = [];

			} else {

				// when client changes; reset all other form fields
				this.f['projectTitle'].patchValue('');
				this.f['projectBannerType'].patchValue('');

				this.f['projectTitle'].enable();

				this.availableProjects = this.Projects.filter( (x:Project) => x.clientId == value && x.status === true);
				this.availableTemplates = this.Templates.filter( (x:Template) => (x.clientId == this.f['projectClient'].value && x.status === true) );

				//console.log('availableTemplates', this.availableTemplates);

				//reset available creative types
				this.availableCreativeTypes.splice(0, this.availableCreativeTypes.length);

				if( this.availableProjects.length <= 0 ) {

					this.alertService.error('Selected Client doesn\'t have any Projects available.', { keepAfterRouteChange: true });
					this.f['projectTitle'].disable();
				} else {

					const templateBannerTypes = this.availableTemplates.map(x=>x.bannertypeId );
					//const availableCreativeTypes:any[] = [];
					this.BannerTypes.forEach( (x:any)=> {
						if( templateBannerTypes.includes( x.id ) ) {
							this.availableCreativeTypes.push(x);
						}
					})

					//console.log('availableCreativeTypes', this.availableCreativeTypes );
				}

			}
		});

		this.selectedProject = this.f['projectTitle'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {

			//console.log('projectTitle:', value);

			if( value === undefined || value === '' || value === null ) {

				this.f['projectBannerType'].disable();
				this.f['projectBannerType'].patchValue('');

			} else {

				this.f['projectBannerType'].enable();
			}
		});

		this.selectedCreativeType = this.f['projectBannerType'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {

			this.resetSelectedCreativeData();

			this.f['projectTemplate'].patchValue('');

			if( value === undefined || value === '' || value === null ) {} else {
				const found =this.BannerTypes.find((x:any) => x.id === value)?.name;
				if( found ) {
					this.creativeType = this.BannerTypes.find((x:any) => x.id === value)?.name;
				}

				/** /
				const checkTemplatesForCreativeType = this.availableTemplates.filter( (x:Template) => (x.bannertypeId === value ) );

				if( checkTemplatesForCreativeType.length <= 0 ) {

					this.alertService.error('Selected Client Project doesn\'t have any Creatives available for the selected Creative Type.', { keepAfterRouteChange: true });
					//this.f['projectTitle'].disable();
				}
				/**/

				//console.log('availableTemplates', this.availableTemplates);
			}

		});

		this.selectedProjectTemplate = this.f['projectTemplate'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {

			//console.log('projectTemplate:', value);

			if( value === undefined || value === '' || value === null ) {

				//this.f['projectBannerSizes'].disable();
				this.f['projectBannerSizes'].patchValue(false);
				//this.task.subtasks.forEach(t => (t.completed = completed));

				this.resetSelectedCreativeData();
				this.resetUIControls();
				this.resetvariationsData();

				this.files = [];
				this.uploadedFileSubject.next(false);

			} else {

				this.activeTemplate = this.Templates.find(x => x.id == value);

				// available bannersizes must be based on the sizes made available by the selected template.
				this.BannerSizes = this.activeTemplate.banners.filter( (x:Banner) => x.status === true ).map((x:any) => x.bannersize);

				//console.log('Current JOB:', this.activeTemplate, this.BannerSizes);
			}
		});

	}

	ngOnDestroy(): void {
		console.warn('Dashboard Component ngOnDestroy');
		this._destroy$.next(false);
		this._destroy$.complete();
	}

	private buildForm():void {
		this.FormGroupProjectDetails = this._formBuilder.group({
			projectTitle: [{value:'', disabled: true}, Validators.required],
			projectClient: [{value:'', disabled: false}, Validators.required],
			projectBannerType: [{value:'', disabled: true}, Validators.required],
			projectTemplate: ['', Validators.required],
			projectBannerSizes: ['', Validators.required],
			//projectBannerSizesControl: ['', Validators.required]
		});

		this.FormGroupVariations = new FormControl('', Validators.required);
	}

	private initialise():void {

		//console.info('Dashboard Component initialise');

		this.dashboardData$ = combineLatest(
			[
				this.templateService.getAll(),
				this.clientService.getAll(),
				this.bannerTypeService.getAll(),
				this.bannerSizeService.getAll(),
				this.projectService.getAll(),
				this.fontTypeService.getAll()
			]
		)
		.pipe(
			map(([templates, clients, bannertypes, bannersizes, projects, fonttypes]):any => {
				//console.info('combineLatest initialise', [templates, clients, bannertypes, bannersizes, projects, fonttypes]);
				// combineLatest returns an array of values, here we map those values to an object
				return { templates, clients, bannertypes, bannersizes, projects, fonttypes };
			})
		);

		this.dashboardData$.pipe(takeUntil(this._destroy$)).subscribe( (data:any) => {
			console.info('Dashboard Component initialise', data);

			this.prepDashboardData(data);
		});

	}

	private prepDashboardData(data:any):void {

		this.Templates = data.templates;
		this.Clients = data.clients;
		this.BannerTypes = data.bannertypes;
		this.BannerSizes = data.bannersizes;
		this.Projects = data.projects;

		data.fonttypes.forEach( (font: FontType) => {
			if( !document.getElementById("font-custom-stylesheet-id-" + font.id) ) {
				const head = document.head;
				const link = document.createElement("link");

				link.type = "text/css";
				link.rel = "stylesheet";
				link.id = "font-custom-stylesheet-id-" + font.id;
				link.href = font.styleSheet;

				head.appendChild(link);
			}
		});

		this.uiDataReady = true;

		this.f['projectClient'].enable();

	}

	public onStepChange(event: any): void {

		console.log('onStepChange:', event);

		//if( event.selectedIndex === 2 ) {
			//this.prepFinalVariationsArray();
		//}
	}

	public creativeReady($event:any):void {

		//console.log('creativeReady:', $event);

		this.activeBannerSizes.forEach( (size:any) => {
			const container = size.containers.find( (container:any) => container.id === $event.containerId);

			//console.log('creativeReady container:', container, size.containers);

			if( container ) {

				if( $event.state === true ) {
					//console.log('creativeReady:', $event, container);
					container.creativeReady = true;
					this.creativeReadySubject.next(true);
				} else {
					container.creativeReady = false;
					this.creativeReadySubject.next(false);
				}
			}
		});

	}

	/**
	 * Data Resets
	 *
	 *
	 */
	public refreshBanner(db?:any) {

		if( db !== undefined ) {
			this.refreshStageSubject.next(db);
		} else {
			this.refreshStageSubject.next(true);
		}
	}

	/**
	 * EVENTS FOR HTML5 CANVAS CREATIVE
	 */
	public playAnimation( banner:any, container:any ) {

		this.animation_isPlaying = this.animation_isPlaying === true ? false : true;

		container.animation_isPlaying = this.animation_isPlaying;

		this.playStageAnimationSubject.next({
			state: this.animation_isPlaying,
			banner: banner,
			container: container
		});
	}

	public frameAnimationStart($event:any) {
		this.animation_isPlaying = true;

		this.activeBannerSizes.forEach( (size:any) => {
			const container = size.containers.find( (container:any) => container.id === $event );
			if( container ) {
				container.animation_isPlaying = true;
			}
		});
	}

	public frameAnimationEnd($event:any) {
		this.animation_isPlaying = false;

		this.activeBannerSizes.forEach( (size:any) => {
			const container = size.containers.find( (container:any) => container.id === $event );
			if( container ) {
				container.animation_isPlaying = false;
			}
		});
	}

	public playGlobalAnimation( banner:any, container:any ) {

		this.animation_isPlaying = this.animation_isPlaying === true ? false : true;
		this.playGlobalAnimationSubject.next(this.animation_isPlaying);
	}

	public GlobalAnimationEnd($event:any) {
		this.animation_isPlaying = false;
		this.playGlobalAnimationSubject.next(null);
	}

	public previewCreative(db?:any) {

		if( db !== undefined ) {
			this.refreshStageSubject.next(db);
		} else {
			this.refreshStageSubject.next(true);
		}
	}

	private resetUIControls() {
		this.creativeType = undefined;
		this.noOfVariations = 0;
		this.completedBannerVariationCounter = 0;
		this.TotalContainersForAllCreatives = 0;
		this.variationsGenerated = false;
		this.variationsExported = false;
		this.exportingProcess = false;
		this.animation_isPlaying = false;
		//this.variationsTracker = [];
		this.variationsTracker.splice(0, this.variationsTracker.length);
	}

	private resetSelectedCreativeData() {
		this.activeTemplate = null;
		//this.BannerSizes = [];
		//this.TemplateRules = [];
		//this.activeBannerSizes = [];
		//this.updateableComponents = [];

		this.BannerSizes.splice(0, this.BannerSizes.length);
		this.TemplateRules.splice(0, this.TemplateRules.length);
		this.activeBannerSizes.splice(0, this.activeBannerSizes.length);
		this.updateableComponents.splice(0, this.updateableComponents.length);
	}

	private resetvariationsData() {

		this.FormGroupVariations.patchValue(false);
		this.variationCollectionForExport.splice(0, this.variationCollectionForExport.length);
		this.intialisePagination();
	}

	/**
	 * User Selected Bannersizes
	 *
	 * @param id (Number)
	 *
	 */
	public selectedBannerSize(id:number | string) {

		const updatableComponents:any[] = [];

		if( this.FormGroupProjectDetails.value.projectBannerSizes === false ) {
			// remove from array
			this.activeBannerSizes = this.activeBannerSizes.filter(x => x.bannersizeId !== id);
			this.updateableComponents = this.updateableComponents.filter(x => x.bannersizeId !== id);
			this.TemplateRules = this.TemplateRules.filter(x => x.bannersizeId !== id);

		} else {

			if( [null, undefined].includes(this.activeTemplate) ) {} else {
				//this.activeBannerSizes.push(this.BannerSizes.find(x => x.id === id));
				this.activeBannerSizes.push(
					this.activeTemplate.banners.find((x:any) => {
						if( x.bannersizeId === id ) {

							x.readyForVariations = false;
							x.variationpercentage = 0;
							x.componentWindowOpen = false;

							// go through all components related to banner size
							x.containers.map((y:any) => {

								y.readyForVariations = false;
								y.componentWindowOpen = false;
								y.animation_isPlaying = false;
								y.creativeReady = false;

								y.components.map((z:any) => {
									z.bannerId = x.id;
									z.bannersizeId = id;
									z.containerDisplayOrder = y.displayorder;
									z.containerDuration = y.duration;
									// for establishing template rules
									if( z.smart === true) {
										z.readyForVariations = false;
										updatableComponents.push(z);
									}
								});
							});

							return x;
						}
					})
				);

				this.TemplateRules.push( {
					'bannersizeId': id,
					'templaterules': this.generateTemplateRules(updatableComponents)
				});

				this.updateableComponents.push(updatableComponents);
			}
		}

		this.countNoofCounters();

		this.updateableComponents = this.updateableComponents.flat();

		//this.activeBannerSizes.readyforvariations = false;
		//console.warn('updatableComponents:', updatableComponents );
		console.warn('activeBannerSizes:', this.activeBannerSizes);
		console.warn('TemplateRules:', this.TemplateRules );
		console.warn('updatableComponents:', this.updateableComponents);
	}

	private generateTemplateRules(dynamicComponents:any): any[] {

		const TemplateRules:any[] = [];

		dynamicComponents.forEach( (component:any) => {

			if( component.componenttype.name === 'Text' || component.componenttype.name === 'Button' ) {
				const textLength:number = (component.componentmeta.find((x:any) => x.name === 'fontValue').value).length;

				TemplateRules.push({
					'componentId': component.id,
					'bannerId': component.bannerId,
					'containerId': component.containerId,
					'name': component.name,
					'type': component.componenttype.name,
					'rules': [
						{
							'maximumcharacters' : textLength
						}
					]
				});

			} else if( component.componenttype.name === 'Image' ) {

				//console.log('template rules:', component.componentmeta);

				TemplateRules.push({
					'componentId': component.id,
					'bannerId': component.bannerId,
					'containerId': component.containerId,
					'name': component.name,
					'type': component.componenttype.name,
					'rules': [
						{
							'width' : component.componentmeta.find((x:any) => x.name === 'width').value,
							'height': component.componentmeta.find((x:any) => x.name === 'height').value
						}
					]
				});
			}
		});

		return TemplateRules;
	}

	private countNoofCounters() {

		let count = 0;

		this.activeBannerSizes.forEach((x:any) => {
			count += x.containers.length;
		});

		this.TotalContainersForAllCreatives = count;

		//return count;
	}

	/**
	 * Events for when user drags and drops files
	 *
	 * @param newItem (Object)
	 *
	 */
	public DragAndDropEventItem(newItem: any) {

		//console.warn('DragAndDropEventItem:', newItem, this.updateableComponents);

		if (!newItem || !newItem.data[0]) return;

		this.files.push(newItem);
		this.uploadedFileSubject.next(newItem);

		// replacing the below
		// const checkRelevantUpdateableComponents = this.updateableComponents.filter((x:any) => x.containerId === newItem.containerId);
		this.activeBannerSizes.find((x:any) => {
			if( ( 'bannerCanvas-' + x.bannersize.width + '-' + x.bannersize.height) === newItem.stage ) {

				x.containers.find((y:any) => {

					if( y.id === newItem.containerId ) {

						let containerReady = true;

						//checkRelevantUpdateableComponents.forEach((z:any) => {
						this.updateableComponents.filter((x:any) => x.containerId === newItem.containerId).forEach((z:any) => {
							if( newItem.type === z.componenttype.name || (newItem.type === 'Text' && z.componenttype.name === 'Button') ) {
								z.readyForVariations = true;
							}
							if ( z.readyForVariations === false ) {
								containerReady = false;
							}
						});

						if ( containerReady === true ) {
							y.componentWindowOpen = false;
						}

						//console.warn('checkRelevantUpdateableComponents:', this.updateableComponents);
					}

				});

				this.isBannerReadyyForVariations(x.id);
			}
		});
	}

	public ResetVariationsEvent(data:any) {

		//console.log('ResetVariationsEvent:', banner);

		this.activeBannerSizes.find((x:any) => {
			if( ( 'bannerCanvas-' + x.bannersize.width + '-' + x.bannersize.height) ===  ( 'bannerCanvas-' + data.banner.bannersize.width + '-' + data.banner.bannersize.height) ) {

				console.log('ResetVariationsEvent:', data);

				x.containers.find((y:any) => {

					if( y.id === data.containerId ) {

						x.readyForVariations = false;
						x.variationpercentage = 0;

						y.readyForVariations = false;

						const stagee = 'bannerCanvas-' + data.banner.bannersize.width + '-' + data.banner.bannersize.height;

						this.resetVariationsSubject.next({
							stage: stagee,
							banner: data.banner,
							containerId: data.containerId
						});

						this.alertService.success('Creative assets for ' + data.banner.bannersize.width + 'x' + data.banner.bannersize.height + ' (Frame: ' + data.containerId + ') removed successfully.', { keepAfterRouteChange: true });
					}
				});

			}
		});
	}

	public RemoveUploadEventItem(removeItem:any) {

		console.log('RemoveUploadEventItem:', removeItem);
		//console.log('this.files:', this.files);

		this.activeBannerSizes.find((x:any) => {

			if( ( 'bannerCanvas-' + x.bannersize.width + '-' + x.bannersize.height) === removeItem.stage ) {

				x.containers.find((y:any) => {

					if( y.id === removeItem.containerId ) {

						switch (removeItem.type) {

							case 'Image':

								let imageCounter = 0;
								this.files.filter((xx:any) => (xx.type ==='Image' && xx.stage === 'bannerCanvas-' + x.bannersize.width + '-' + x.bannersize.height) ).map((y)=> {
									if( y.data.length > 0 ) {
										imageCounter++;
									}
								});

								//console.log('imageCounter:', imageCounter);

								if( imageCounter === 0 ) {
									x.variationsImageReadyCounter = 0;
									x.variationsImageReady = false;
									//this.noOfVariationsForGeneration = this.noOfVariationsForGeneration - 0.5;
								} else {
									x.variationsImageReadyCounter--;
								}

								break;

							case 'Text':
							case 'Copy':
							case 'Button':

								x.variationsCopyReady = false;
								//this.noOfVariationsForGeneration = this.noOfVariationsForGeneration - 0.5;

								break;
						}

						this.removeUploadItemSubject.next(removeItem);

						this.alertService.success('Uploaded "' + removeItem.componentName  + '" asset (Frame: ' + removeItem.containerId + ') for Creative removed successfully.', { keepAfterRouteChange: true });

					}
				});

			}
		});
	}

	/**
	 * Send Variation Event to the Banner Directive for creating variations
	 *
	 * @param bannerComponent (Object)
	 *
	 */
	public generateVariations(bannerComponent:any) {

		//console.log('generateVariations', bannerComponent);
		bannerComponent.componentWindowOpen = false;

		bannerComponent.containers.map((x:any) => {
			x.componentWindowOpen = false;
		});

		this.noOfVariations++;
		bannerComponent.readyForVariations = true;
		this.variationsEvent.emit(bannerComponent);

		//this.FormGroupVariations.value.variationsReady = true;

	}

	public generateAllVariations() {

		for (let index = 0; index < this.updateableComponents.length; index++) {
			const element = this.updateableComponents[index];

			if( element.readyForVariations === false ) {

				const faultyBanners = this.activeBannerSizes.find((x:any) => (x.id === element.bannerId));

				console.error('faultyBanners:', faultyBanners, element);

				this.alertService.error('Please upload all the assets for the '+ faultyBanners.name +' creative before attempting to generate all variations.', { keepAfterRouteChange: true });

				this.variationsGenerated = false;

				return;

				break;
			}
		}

		this.activeBannerSizes.forEach((x:any) => {
			x.readyForVariations = true;
			this.generateVariations(x);
		});

		this.variationsGenerated = true;

	}

	/**
	 * Used to determine if the container/frame for the Creative size is
	 * ready for variations.
	 *
	 * Updates this.variationsTracker object accordingly.
	 *
	 * @param bannerId (String)
	 *
	 */
	private isBannerReadyyForVariations(bannerId:string):void {

		let status = true;
		const chhh = this.updateableComponents.filter((x:any) => x.bannerId === bannerId);

		for (let index = 0; index < chhh.length; index++) {
			const element = chhh[index];

			if( element.readyForVariations === false ) {

				status = false;

				break;
			}
		}

		if( status === true ) {
			this.activeBannerSizes.find((x:any) => {
				if( x.id === bannerId ) {
					x.readyForVariations = true;
					x.componentWindowOpen = false;

					this.variationsTracker.push({
						bannerId: x.id,
						counter: 0,
						noOfContainers: x.containers.length,
						frames: []
					});

				}
			});
		}

		console.warn('isBannerReadyyForVariations', this.variationsTracker, this.updateableComponents);

	}

	public acceptCollectionOfVariationsFromBannerComponent(bannerComponentVariationCollection:any) {

		//console.log('CreativeType:', this.f['projectBannerType'].value);
		//console.log('acceptCollectionOfVariationsFromBannerComponent:', bannerComponentVariationCollection);

		//const creativeType = this.BannerTypes.find((x:any) => x.id === this.f['projectBannerType'].value)?.name;

		if( this.creativeType === 'GIFs' || this.creativeType === 'HTML5' ) {

			this.variationsTracker.find((x:any) => {
				if( x.bannerId === bannerComponentVariationCollection.bannerId ) {

					x.counter = x.counter + 1;

					bannerComponentVariationCollection.data.forEach((y:any)=> {

						/** /
						if( y.stageUpdateComponents === undefined || y.stageUpdateComponents.length === 0 ) {} else {
							for (let index = 0; index < y.stageUpdateComponents.length; index++) {
								const element = y.stageUpdateComponents[index];
								y.stageComponents[element.componentIndex].componentmeta[element.componentMetaIndex].value = element.value;

								console.log('y updated:', y);
							}
						}
						/**/

						x.frames.push(
							y
						);
					});

					if( x.counter == x.noOfContainers ) {

						this.generateAllFrames(x.frames)
						.then( (FinalGIFVariations:any[]) => {

							this.variationCollectionForExport.push(FinalGIFVariations);

							if ( this.TotalContainersForAllCreatives === this.completedBannerVariationCounter ) {
								this.prepFinalVariationsArray();
								this.intialisePagination();

								this.variationsExported = true;
								this.FormGroupVariations.patchValue(true);
								this.exportingProcess = false;
							}

						});

					}
				}
			});

		} else if( this.creativeType === 'Static JPG' ) {

			bannerComponentVariationCollection.data.forEach((x:any)=> {
				this.variationCollectionForExport.push(x);
			});

			this.prepFinalVariationsArray();

			this.variationsExported = true;
			this.FormGroupVariations.patchValue(true);
			this.exportingProcess = false;

			this.intialisePagination();

		}

	}

	private prepFinalVariationsArray() {
		this.variationCollectionForExport = this.variationCollectionForExport.flat();
		console.warn('variationCollectionForExport:', this.variationCollectionForExport );
	}

	private generateAllFrames(allFrames:any[]): Promise<any> {

		return new Promise<any>((resolve, reject) => {

			const groupedArray = groupBy(allFrames, 'containerId');
			const containerIdKeys = Object.keys(groupedArray);

			//console.log('All GIF Frames:', x.frames);
			//console.log('GIF groupedArray:', groupedArray);

			//groupedArray = groupedArray.reverse();

			const varss:any = {};
			containerIdKeys.forEach(key => {
				varss[key] = groupedArray[key].map((zz:any) => zz.uid );
			});

			//console.log('varss:', varss);

			const allFramesCartesianProduct:any = getCartesianProduct(varss);

			let GCPCounter = 0;

			// initialise Arrays
			const FinalGIFVariations:any[] = [...Array(allFramesCartesianProduct.length)].map((jj:any[]) => []);
			FinalGIFVariations.map((j:any[]) => j = [...Array(containerIdKeys.length)].map(jj => []) );

			//console.log('allFramesCartesianProduct:', allFramesCartesianProduct);
			//console.log('FinalGIFVariations:', FinalGIFVariations);

			allFramesCartesianProduct.forEach( (framescombination:any) => {

				for (const key in framescombination) {
					if (Object.prototype.hasOwnProperty.call(framescombination, key)) {
						const element = framescombination[key];
						if( groupedArray[key] ) {
							const uid_frame = groupedArray[key].find((ogAllFrames:any) => ogAllFrames.uid === element);
							FinalGIFVariations[GCPCounter].push(uid_frame);
						}
					}
				}

				GCPCounter++;

			});

			// sort containers by user defined order
			FinalGIFVariations.forEach((x:any[]) => {
				x.forEach((y:any) => {
					//const cont = y.bannerComponent.containers.find((z:any) => z.id === y.containerId);
					//console.log('displayOrder:', cont);
					y.displayorder = y.bannerComponent.containers.find((z:any) => z.id === y.containerId).displayorder;
				});

				x.sort((a, b) => (a.displayorder > b.displayorder) ? 1 : -1);
			});

			//console.warn('FinalGIFVariations:', FinalGIFVariations);

			resolve(FinalGIFVariations);

		});

	}

	private generateGIFs(variation:any[]): Promise<Blob> {

		return new Promise<Blob>((resolve, reject) => {

			// https://stackoverflow.com/questions/21913673/execute-web-worker-from-different-origin
			urlContentToDataUri(`${environment.apiUrl}/gif.worker.js`)
			.then(
				(WorkerScriptResult) =>{

					const gif = new GIF({
						workerScript: WorkerScriptResult,
						workers: 5,
						quality: 10
						//background: '#000'
					});

					variation.forEach((variationImgFrame:any)=> {

						//console.log('generateGIFs variation:', variationImgFrame);

						gif.addFrame( variationImgFrame, {delay: 3000});

					});

					gif.on('finished', (blob: Blob)=> {

						console.log('GIF Ready:', blob, gif);

						//const dataURL = URL.createObjectURL(blob);

						resolve(blob);

					});

					gif.render();
				}
			);

		});
	}

	private generateImageFromDataURI( imgDataURL:string ): Promise<HTMLImageElement> {

		return new Promise(
			(resolve, reject) => {

				const img = new Image();

				img.addEventListener("load", () => {
					//console.log('Frame Image Loaded');

					resolve(img);

				});
				img.src = imgDataURL;

			}
		);

	}

	/**
	 * Used to generate all the final GIFs
	 *
	 * @param FinalGIFVariation (Array)
	 *
	 */
	private GIFImagesFromDataURI( FinalGIFVariation:any[]): Promise<HTMLImageElement[]> {

		const allFrameImages:any[] = [];

		for (let index = 0; index < FinalGIFVariation.length; index++) {
			const element = FinalGIFVariation[index];
			allFrameImages.push(this.generateImageFromDataURI(element.image))
		}

		return Promise.all(allFrameImages);

	}

	/**
	 * Send Variation Event to the Banner Directive for downloading variations
	 *
	 * @param bannerComponent (Object)
	 *
	 */
	public exportVariation(bannerComponent:any) {

		this.downloadVariationsEvent.emit(bannerComponent);

	}

	public progressPercentage(data:any) {

		this.activeBannerSizes.find( (x) =>  {
			if( x.bannersize.id === data.bannersizeId ) {
				x.variationpercentage = data.value;
				if( data.value === 100 ) {

					//console.log('progressPercentage:', data );
					//console.log('progressPercentage:', data, this.f['projectBannerType'].value);
					this.completedBannerVariationCounter++;

					//if ( this.TotalContainersForAllCreatives === this.completedBannerVariationCounter ) {
					//	this.prepFinalVariationsArray();
					//}

					//console.log('completedBannerVariationCounter:', this.completedBannerVariationCounter );
				}
			}
		});

		//this.percentage = data

	}

	public exportAllVariations() {

		this.exportingProcess = true;

		this.accordion.closeAll()

		this.activeBannerSizes.forEach((x:any) => {
			this.exportVariation(x);
		});

		//this.variationsExported = true;
		//this.FormGroupVariations.patchValue(true);

	}

	public downloadAllVariations(){

		this.generatingDownloads = true;

		const pauseBeforeBatch = setTimeout(() => {

			clearTimeout(pauseBeforeBatch);

			if( this.creativeType === 'Static JPG' ) {

				const zip = new JSZip();

				this.activeBannerSizes.forEach((x:any) => {
					//console.log(x.bannersize.width + 'x' + x.bannersize.height);

					const bannerName = x.bannersize.width + 'x' + x.bannersize.height;

					const img1 = zip.folder(bannerName);

					const BannersIWant = this.variationCollectionForExport.filter( (varCollection:any) =>
						{
							if( bannerName === (varCollection.bannerComponent.bannersize.width + 'x' + varCollection.bannerComponent.bannersize.height) )
							{
								return varCollection;
							}
						}
					);

					BannersIWant.forEach((blobs: any) =>{
						img1?.file(blobs.name+'.jpg', blobs.blobFile);
					});
				});

				zip.generateAsync({type:"blob"})
				.then(	(blobs) => {
					this.generatingDownloads = false;
					saveAs(blobs, 'variations.zip')
				});

			} else if( this.creativeType === 'GIFs' ) {

				const allVariationsGIFImages:any[] = [];

				this.variationCollectionForExport.forEach( (GIFIMages:any[]) => {

					allVariationsGIFImages.push(this.GIFImagesFromDataURI(GIFIMages));
				});

				Promise.all(allVariationsGIFImages).
					then( (allVariationsGIFImage:any[]) => {

						//console.log('allVariationsGIFImages', allVariationsGIFImage);

						return urlContentToDataUri(`${environment.apiUrl}/gif.worker.js`)
						.then(
							(WorkerScriptResult:any) => {

								return new Promise<Blob[]>((resolve, reject) => {

									let blobCounter = 0;
									const allBlobs:any[] = [];

									const gif = new GIF({
										workerScript: WorkerScriptResult,
										workers: 5,
										quality: 10,
										debug: false
										//background: '#000'
									});

									gif.on('finished', (blob: Blob)=> {

										//window.open(URL.createObjectURL(blob));

										allBlobs.push(blob);

										//console.warn('GIF Ready element['+ index + ']:');
										//console.log('GIF Ready blob:', blob);
										//console.log('GIF Ready gif:', gif);

										gif.abort();
										// empty frames
										gif.frames.splice(0, gif.frames.length);

										blobCounter++;

										if( blobCounter === allVariationsGIFImage.length ) {

											//console.warn('allBlobs:', allBlobs, blobCounter);

											//this.generatingDownloads = false;

											resolve(allBlobs);

										} else {

											console.log('Next GIF:', blobCounter);

											aadFrmw();

										}

										//console.log('GIF Ready abort:', gif);

										//gif = undefined;
										//const dataURL = URL.createObjectURL(blob);
										//return blob;

									});

									function aadFrmw() {
										const element = allVariationsGIFImage[blobCounter];

										element.forEach((variationImgFrame:any)=> {

											//console.log('generateGIFs variation:', variationImgFrame);
											gif.addFrame( variationImgFrame, {delay: 3000});

										});

										gif.render();
									}

									aadFrmw();

								});

							}
						);

					})
					.then( (gifs:Blob[]) => {

						console.log('All GIFS:', gifs);

						const zip = new JSZip();

						/**/
						for (let index = 0; index < gifs.length; index++) {
							const element = gifs[index];
							zip.file( generateUUID()+'.gif', element);
						}

						zip.generateAsync({type:"blob"})
						.then((blobs) => {
							this.generatingDownloads = false;
							saveAs(blobs, 'GIF-VARIATIONS.zip')
						});
						/**/
					});

			} else if( this.creativeType === 'HTML5' ) {

				const allVariationsHTML5:any[] = [];

				//let count = 0;

				this.variationCollectionForExport.forEach((x:any, counter:number) => {

					const stages:any[] = [];
					const banner = x[0].bannerComponent;
					for (let index = 0; index < x.length; index++) {
						const element = x[index];
						stages.push(
							{
								counter: counter,
								components: element.stageComponents,
								componentsUpdate: element.stageUpdateComponents
							}
						)
					}


					allVariationsHTML5.push(
						this.bannerCreatorService.batchHTML5ForExportGetPrepData(banner, stages)
					);

				});

				Promise.all(allVariationsHTML5)
				.then( (allVariationsHTML5:any[]) => {

					this.alertService.info('All HTML5 Data Prepped. Please be Patient.', { keepAfterRouteChange: true });

					//console.log('All HTML5 Prep Data:', allVariationsHTML5);

					const allZipBlobs:any[] = [];

					allVariationsHTML5.forEach((variationFiles:any, index:number) => {

						allZipBlobs.push(this.bannerCreatorService.generateBatchZIPpackage(variationFiles));

					});

					Promise.all(allZipBlobs)
					.then( (allZipBlob:any[]) => {
						//console.log('All HTML5 Variation ZIPS:', allZipBlob);

						const groupResultsByBannerSize = groupBy( allZipBlob, 'name' );

						//console.log('All HTML5 Variation ZIPS:', groupResultsByBannerSize);

						this.alertService.info('All HTML5 Creatives Ready. Creating your final file. Please be patient.', { keepAfterRouteChange: true });

						/**/
						const zip = new JSZip();

						const constBannersizes = Object.keys(groupResultsByBannerSize);

						constBannersizes.forEach((bannersize:string) => {
							const element = groupResultsByBannerSize[bannersize];

							const bannersizeFolderName = zip.folder(bannersize);
							//bannersizeFolderName.file(countVar+'.zip', element.blobFile);

							let countVar = 0;

							element.forEach((variationBlob:any) => {
								bannersizeFolderName?.file(`${bannersize}-${countVar}.zip`, variationBlob.blob);
								countVar++;
							});
						});

						zip.generateAsync({type:"blob"})
							.then((blobs) => {
								console.log('All HTML5 Variation ZIP Ready:', blobs);
								this.alertService.success('HTML5 Variations Ready for download.', { keepAfterRouteChange: true });
								this.generatingDownloads = false;
								saveAs(blobs, 'HTML5-VARIATIONS.zip');
							});
						/**/

					});

				});

			}

		}, 1000);
	}

	/*
	 * Dashboard Step 3 Variations Pagination
	 *
	 */
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
				default: return 0;
			}
		});
	}

	private compare(a: number | string | boolean, b: number | string | boolean, isAsc: boolean) : number {
		return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
	}

	public setPageSizeOptions(setPageSizeOptionsInput: string) {
		if (setPageSizeOptionsInput) {
			this.pageSizeOptions = setPageSizeOptionsInput.split(',').map(str => +str);
		}
	}

	public handlePage(e: any) {

		/** /
		console.log('Paginating:', e, {
			'previousStage': this.stages[e.previousPageIndex],
			'currentStage': this.stages[e.pageIndex]
		});
		/**/

		this.currentPage = e.pageIndex;
		this.pageSize = e.pageSize;
		this.iterator();
	}

	private iterator() {
		const end = (this.currentPage + 1) * this.pageSize;
		const start = this.currentPage * this.pageSize;
		const part = this.variationCollectionForExport.slice(start, end);
		this.sortedData = part;
	}

	private intialisePagination() {
		this.sortedData = this.variationCollectionForExport.slice();
		this.pageLength = this.sortedData.length;
		this.iterator();
	}

	/*
	 * Filter Functions
	 *
	 */
	public onFilterChange( filter:string ): void {

		let newdata: any;

		// use form patch value
		// show meta data table when editing
		//this.clientFilterValue.value = '';
		//this.templateFilterValue.value = '';
		///this.bannersizeFilterValue.value = '';
		//this.bannertypeFilterValue.value = '';

		//console.warn('onFilterChange:', filter, this.bannersizeFilterValue.value );

		newdata = this.variationCollectionForExport;

		if( this.bannersizeFilterValue.value && this.bannersizeFilterValue.value !== undefined ) {
			newdata = newdata.filter((x:any) => {
				return x.bannersizeId === this.bannersizeFilterValue.value
			});
		}

		this.sortedData = newdata.slice();
		this.pageLength = this.sortedData.length;

		const end = (this.currentPage + 1) * this.pageSize;
		const start = this.currentPage * this.pageSize;
		const part = newdata.slice(start, end);
		this.sortedData = part;

		//this.iterator();

		//this.intialisePagination();
		//this.initialise(newdata);

	}

	/*
	 * Dashboard UI Functions
	 *
	 */
	public back(): void {
		this.location.back();
	}

	public help(): void {

		this.introJS.refresh();

		if (this.activeBannerSizes.length <= 0 ) {

			this.introJS.setOptions({
				showStepNumbers: true,
				showProgress: true,
				steps: [
					{
						//title: 'Genrating Creatives',
						element: '#select-client-drp',
						intro: "First things first, select a client to view the available Projects and Creatives.",
						position: 'bottom-right-aligned'
					},
					{
						element: '#select-project-drp',
						intro: "Click here to select the project you will be working on.",
						position: 'bottom-right-aligned'
					},
					{
						element: '#select-creative-drp',
						intro: "Select the available list of Creatives available to the Client and selected Project.",
						position: 'bottom-right-aligned'
					},
					{
						//element: '#select-layout-drp',
						intro: "Once you have selected a Creative, A list of available templates will be available. Once you've selected a Template, a List of creative sizes will be available for you to choose before you can move on to the second Step.",
						position: 'bottom-right-aligned'
					}
					/** /
					{
						element: '#select-size-chk',
						intro: "Choose banner size/s to work on.",
						position: 'bottom-right-aligned'
					},
					{
						element: '#next-btn',
						intro: "Click here to proceed to uploading assets. ",
						position: 'bottom-right-aligned'
					},
					/**/
				]
			})
			.onbeforechange(function(targetElement) {
				//console.log('onchange', targetElement);
				if( targetElement.id ==='select-project-drp' ) {

				}
			});

		} else if (this.activeBannerSizes.length > 0 && this.completedBannerVariationCounter < this.activeBannerSizes.length ) {

			this.introJS.setOptions({
				showStepNumbers: true,
				showProgress: true,
				steps: [

					{
						element: '#edit-banner',
						intro: "Click here to upload the required assets for the creative.",
						position: 'bottom-right-aligned'
					},
					{
						element: '#toggle-btn-assets',
						intro: "Click here to open or hide the creative assets dialog for uploading assets.",
						position: 'bottom-left-aligned'
					},
					{
						element: '.variation-status',
						intro: "Once all required assets have been uploaded this indicator will turn green.",
						position: 'bottom-left-aligned'
					},
					{
						element: '#btn-generate',
						intro: "Click here to generate all the variations of the creatives so you can export them. You can preview the variations using the pagination bar at the bottom of the Creative Canvas.",
						position: 'bottom-right-aligned'
					},
					/** /
					{
						element: '.pagination-holder',
						intro: "You can preview the generated variations for each banner size by paginating through the options.",
						position: 'bottom-right-aligned'
					},
					/**/
					{
						element: '#btn-export',
						intro: "Click here to export all the generated createive variations so you can download them.",
						position: 'bottom-right-aligned'
					},
					{
						element: '#btn-download',
						intro: "Click here to go to proceed to the next screen to download all generated variations.",
						position: 'bottom-right-aligned'
					},

				]
			});

		} else if (this.completedBannerVariationCounter === this.activeBannerSizes.length) {

			this.introJS.setOptions({
				showStepNumbers: true,
				showProgress: true,
				steps: [
					{
						element: '#btn-download-all',
						intro: "Click here to download all generated vaiations. You can also download individual variations in the table below.",
						position: 'bottom-left-aligned'
					},
					{
						element: '.model-action-change-creative-name',
						intro: "Click here to change the name of the creative",
						position: 'bottom-left-aligned'
					},
					{
						element: '.model-action-download-creative',
						intro: "Click here to download the creative.",
						position: 'bottom-left-aligned'
					},
					{
						element: '.model-action-preview-creative',
						intro: "You can also click on the preview image to view the full-size creative and edit it's name or download it.",
						position: 'bottom-left-aligned'
					}
				]
			});

		}

		//console.log(this.completedBannerVariationCounter, this.activeBannerSizes.length);

		//this.introJS.addHints();

		//this.introJS.showHints();

		this.introJS.start();

	}

	public toggleUploadWindow(banner:any, container:any) {

		if( banner.componentWindowOpen === true && container.componentWindowOpen === true ) {
			banner.componentWindowOpen = false;
			container.componentWindowOpen = false;

		} else {
			banner.containers.map((x:any) => {
				x.componentWindowOpen = false;
			});
			banner.componentWindowOpen = true;
			container.componentWindowOpen = true;
		}
	}

	public CloseComponentWindow($event:any) {

		$event.dataBanner.componentWindowOpen = false;
		$event.dataContainer.componentWindowOpen = false;
	}

	public onOpenedChange(o: boolean) {
		console.log(`Drawer IsOpen: ${o}`);
	}

	public openPreview(variation: any): void {

		this.variationCollectionForExport.map((x)=>{
			if( x.isOpen === true ) {
				this.newVariationNameValue.setValue(x.name, {emitEvent:false});
				x.isOpen = false;
			}
			//x.isOpen = false
		});
		variation.isOpen = true;

		this.variationPreviewConfig(variation);
	}

	private variationPreviewConfig(variation:any):void {

		this.newVariationNameValue = new FormControl('');
		// this.newVariationNameValue = new FormControl('', Validators.required);
		this.newVariationNameValue.patchValue(variation.name);

		if( this.newVariationNameValue ) {
			this.newVariationNameValue.valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {
				variation.name = value;
			});
		}
	}

	public editVariationName(id: number): void {

		//console.log('id',id);
		const model = this.variationCollectionForExport[id];
		model.isEditingVariation = true;

		const previewDialog = this.dialog.open( DialogEditVariationFormComponent, {
			data: {
				name: model.name,
				model: model
							}
		});

		previewDialog.afterClosed().subscribe(result => {

			if( result === false ) {

				this.alertService.info('Creative Name Unchanged.', { keepAfterRouteChange: true });

				model.isEditingVariation = false;

			} else {
				//console.info('Value updated closed:', result);
				model.isEditingVariation = false;
				this.variationCollectionForExport.find((x:any, index:number) => index === id).name = result;
				this.alertService.info('Creative Name Changed Successfully.', { keepAfterRouteChange: true });
			}
		});
	}

	public downloadVariation(id: number): void {

		if( this.creativeType === 'Static JPG' ) {

			const model = this.variationCollectionForExport[id];

			const anchor = document.createElement("a");
			anchor.setAttribute( "download", model.name + '.png');
			anchor.setAttribute( "href", model.image);

			anchor.click();

		} else if( this.creativeType === 'GIFs' ) {

			let model = this.variationCollectionForExport[id];
			//console.log('Download GIF Variation:', id, model);

			model = model.reverse();

			const allFrameImages = [];

			for (let index = 0; index < model.length; index++) {
				const element = model[index];
				allFrameImages.push(this.generateImageFromDataURI(element.image))
			}

			Promise.all(allFrameImages)
			.then( (allFrames:any[]) => {
				this.generateGIFs(allFrames)
				.then( (gifBlob:any) => {

					window.open(URL.createObjectURL(gifBlob));

				});
			});

		} else if( this.creativeType === 'HTML5' ) {

			const model = this.variationCollectionForExport[id];

			console.log('Download HTML5 Variation:', id, model);

			const banner = model[0].bannerComponent;
			const stages:any[] = [];
			model.forEach((x:any) => {
				stages.push(
					{
						components: x.stageComponents,
					}
				)
			});

			this.bannerCreatorService.buildHTML5ForExport(banner, stages)
			.then((files:any) => {
				console.log('Download HTML5 Variation Files:', files);
			});

		}

	}

	public nextPreviewVariation(id: number): void {

		const model = this.variationCollectionForExport[id];
		const oldmodel = this.variationCollectionForExport[(id -1)];

		oldmodel.isOpen = false;
		model.isOpen = true;

		this.variationPreviewConfig(model);

	}

	public previousPreviewVariation(id: number): void {

		const model = this.variationCollectionForExport[id];
		const oldmodel = this.variationCollectionForExport[(id + 1)];

		oldmodel.isOpen = false;
		model.isOpen = true;

		this.variationPreviewConfig(model);

	}

	public ListtrackByFn(index:number, item:any) {
		return index; // or item.id
	}

}
@Component({
	selector: 'app-edit-variation-dialog',
	templateUrl: 'dialog.edit.variations.component.html',
	styleUrls: ['dialog.edit.variations.component.scss']
})
export class DialogEditVariationFormComponent  implements OnInit {

	public form!: FormGroup;
	//public id!: string;
	//public isAddMode!: boolean;
	public loading = false;
	public submitted = false;

	constructor(
		private alertService: AlertService,
		private formBuilder: FormBuilder,
		public dialogRef: MatDialogRef<DialogEditVariationFormComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {}

	get f() { return this.form.controls; }
	ngOnInit() {
		//this.isAddMode = !this.id;

		this.form = this.formBuilder.group({
			name: ['', Validators.required]
		});

		this.form.controls['name'].patchValue(this.data.name);

	}

	public onSubmit(): void {
		this.submitted = true;

		//console.warn('value', this.form.value);
		//console.log('Submit',this.submitted);

		// reset alerts on submit
		this.alertService.clear();

		// stop here if form is invalid
		if (this.form.invalid) {
			this.submitted = false;
			this.alertService.error('Variation name can not be empty.', { keepAfterRouteChange: true });
			return;
		}

		this.loading = true;

		this.dialogRef.close(this.form.controls['name'].value);

	}
}
