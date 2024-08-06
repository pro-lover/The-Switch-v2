import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Location } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { FontType } from '@app/core/models';
import { AlertService, BannerService, ComponentService, FontTypeService } from '@app/core/services';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-component-add',
	templateUrl: './add.template.banner.component.dialog.html',
	styleUrls: ['./add.template.banner.component.dialog.scss'],
	providers: [
		{
			provide: STEPPER_GLOBAL_OPTIONS,
			useValue: {showError: true},
		},
	],
})
export class TemplatesAddDialogComponent implements OnInit, OnDestroy {

	// will use the _destroy$ observable to control
	// fetching items from an observable
	private _destroy$ = new Subject<boolean>();

	isAddMode!: boolean;
	loading = false;
	submitted = false;
	uploadComplete = false;

	private uploadedItem: any;
	private uploadedFileSubject: BehaviorSubject<any[] | unknown>;
	public uploadedFileObs: Observable<any[] | unknown>;

	@Input() componentPositionUpdate!: any;

	@Input() formDataComponentType!: any;
	@Input() dataBannerContainerId!: number | string;
	@Input() dataTemplate!: any;
	@Input() dataBanner!: any;

	@Output() FDCEvent = new EventEmitter<any>();
	@Output() EditComponentEvent = new EventEmitter<any>();
	@Output() DeleteComponentEvent = new EventEmitter<any>();
	@Output() ResetEvent = new EventEmitter<any>();
	@Output() RemoveUploadEvent = new EventEmitter<any>();

	public activeBannerComponents: any[] = [];

	public fontFamilies: FontType[] = [];

	public FormGroupComponentMeta!: FormGroup;

	private resetVariationsSubject: BehaviorSubject<any>;
	public resetVariationsObs: Observable<any>;

	constructor(
		private formBuilder: FormBuilder,
		private dialog: MatDialog,
		private location: Location,
		private route: ActivatedRoute,
		private fontTypeService: FontTypeService,
		private alertService: AlertService,
		private bannerService: BannerService,
		private componentService: ComponentService
	) {

		this.uploadedFileSubject = new BehaviorSubject<any[] | unknown>(null);
		this.uploadedFileObs = this.uploadedFileSubject.asObservable();

		this.resetVariationsSubject = new BehaviorSubject<boolean>(false);
		this.resetVariationsObs = this.resetVariationsSubject.asObservable();
	}

	// convenience getter for easy access to form fields
	get ftemplatecomponent() { return this.FormGroupComponentMeta.controls; }

	ngOnInit() {

		this.isAddMode = true;

		if ( this.formDataComponentType.name == 'Text' || this.formDataComponentType.name == 'Button' ) {

				this.fontTypeService.fontType.pipe(takeUntil(this._destroy$)).subscribe((data: FontType[]) => {
					if( data !== null ) {
						this.fontFamilies = data;

						//console.warn('Text AddComponent FontFamilies:', this.fontFamilies);
					}
				});
		}

		this.bannerService.getById(this.dataBanner.id).pipe(takeUntil(this._destroy$)).subscribe((data: any) => {
			//console.log('Current Banner From DB:', data);
			this.activeBannerComponents = data.containers.find( (container:any) => container.id === this.dataBannerContainerId ).components;
		});

		//this.activeBannerComponents = this.dataBanner.containers.find( (container:any) => container.id === this.dataBannerContainerId ).components;

		this.prepareForm();

	}

	ngOnDestroy(): void {
		console.warn('Template Banner Add Component Dialog ngOnDestroy');
		this._destroy$.next(false);
		this._destroy$.complete();
	}

	/**
	 * Prepare Form variables for a new component
	 *
	 * formDataComponentType is the empty component type from the database. Hence using 'name'
	 * to initialise the form controls for each respective component type.
	 *
	 */
	private prepareForm() {
		console.log('prepareForm')
		if( this.formDataComponentType.name === 'Text' ) {

			this.FormGroupComponentMeta = this.formBuilder.group({
				componentTypeId: [this.formDataComponentType.id, Validators.required],
				componentTypeName: [this.formDataComponentType.name, Validators.required],
				defaultName: ['', Validators.required],
				componentName: ['', Validators.required],
				zIndex: ['', Validators.required],
				positionY: ['', Validators.required],
				positionX: ['', Validators.required],
				componentWidth: ['', Validators.required],
				componentHeight: ['', Validators.required],
				fontFamilyId: ['', Validators.required],
				fontFamily: ['', Validators.required],
				fontWeight: ['', Validators.required],
				fontStyle: ['', Validators.required],
				fontSize: ['', Validators.required],
				fontLineHeight: ['', Validators.required],
				fontColour: ['', Validators.required],
				fontValue: ['', Validators.required],
				textAlign: ['', Validators.required],
			});

			this.ftemplatecomponent['fontFamilyId'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {

				this.fontFamilies.find( (font) => {
					if( parseInt(font.id) === parseInt(value) ) {
						//console.log('fontFamily:', font);
						this.ftemplatecomponent['fontFamily'].patchValue(font.fontFamily);
						this.ftemplatecomponent['fontWeight'].patchValue(font.fontWeight);
						this.ftemplatecomponent['fontStyle'].patchValue(font.fontStyle);
					}
				});

			});

		} else if( this.formDataComponentType.name === 'Shape' ) {

			this.FormGroupComponentMeta = this.formBuilder.group({
				componentTypeId: [this.formDataComponentType.id, Validators.required],
				componentTypeName: [this.formDataComponentType.name, Validators.required],
				componentName: ['', Validators.required],
				defaultName: ['', Validators.required],
				shapeColour: ['', Validators.required],
				zIndex: ['', Validators.required],
				positionY: ['', Validators.required],
				positionX: ['', Validators.required],
				componentWidth: ['', Validators.required],
				componentHeight: ['', Validators.required],
			});

		} else if( this.formDataComponentType.name === 'Button' ) {

			this.FormGroupComponentMeta = this.formBuilder.group({
				componentTypeId: [this.formDataComponentType.id, Validators.required],
				componentTypeName: [this.formDataComponentType.name, Validators.required],
				defaultName: ['custom', Validators.required],
				componentName: [
					'cta_button_' + this.getRandomArbitrary(99, 99999).toFixed(0),
					Validators.required
				],
				zIndex: ['', Validators.required],
				positionY: ['', Validators.required],
				positionX: ['', Validators.required],
				componentWidth: ['', Validators.required],
				componentHeight: ['', Validators.required],
				fontFamilyId: ['', Validators.required],
				fontFamily: ['', Validators.required],
				fontWeight: ['', Validators.required],
				fontStyle: ['', Validators.required],
				fontSize: ['', Validators.required],
				fontLineHeight: ['', Validators.required],
				fontColour: ['', Validators.required],
				fontValue: ['', Validators.required],
				textAlign: ['', Validators.required],
				shapeColour: ['', Validators.required],
				shapeRadiusTL: [0,
					[
						Validators.required,
						Validators.minLength(0)
					]
				],
				shapeRadiusTR: [0,
					[
						Validators.required,
						Validators.minLength(0)
					]
				],
				shapeRadiusBR: [0,
					[
						Validators.required,
						Validators.minLength(0)
					]
				],
				shapeRadiusBL: [0,
					[
						Validators.required,
						Validators.minLength(0)
					]
				],
				shapePaddingTop: [0,
					[
						Validators.required,
						Validators.minLength(0)
					]
				],
				shapePaddingRight: [0,
					[
						Validators.required,
						Validators.minLength(0)
					]
				],
				shapePaddingBottom: [0,
					[
						Validators.required,
						Validators.minLength(0)
					]
				],
				shapePaddingLeft: [0,
					[
						Validators.required,
						Validators.minLength(0)
					]
				]
			});

			this.ftemplatecomponent['fontFamilyId'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {

				this.fontFamilies.find( (font) => {
					if( parseInt(font.id) === parseInt(value) ) {
						//console.log('fontFamily:', font);
						this.ftemplatecomponent['fontFamily'].patchValue(font.fontFamily);
						this.ftemplatecomponent['fontWeight'].patchValue(font.fontWeight);
						this.ftemplatecomponent['fontStyle'].patchValue(font.fontStyle);
					}
				});

			});

		} else {

			this.FormGroupComponentMeta = this.formBuilder.group({
				componentTypeId: [this.formDataComponentType.id, Validators.required],
				componentTypeName: [this.formDataComponentType.name, Validators.required],
				componentName: ['', Validators.required],
				defaultName: ['', Validators.required],
				zIndex: ['', Validators.required],
				positionY: ['', Validators.required],
				positionX: ['', Validators.required],
				componentWidth: ['', Validators.required],
				componentHeight: ['', Validators.required],
			});

		}

		this.ftemplatecomponent['defaultName'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {

			if( value === "custom" ) {

				this.ftemplatecomponent['componentName'].patchValue('');

			} else {

				//const componentCheck = this.dataBanner.containers.find( (container:any) => container.id === this.dataBannerContainerId ).components;

				const componentNameExists = this.activeBannerComponents.find( (component:any) => component.name === value);

				//console.log('componentNameExists', componentCheck, componentNameExists);

				if( componentNameExists ) {

					this.alertService.error('This component name already exists. Please select "Custom" and specify a unique name.');

					this.ftemplatecomponent['defaultName'].patchValue('custom');
					this.ftemplatecomponent['componentName'].patchValue(value + '_' + this.getRandomArbitrary(99, 99999).toFixed(0));

				} else {

					this.ftemplatecomponent['componentName'].patchValue(this.noSpecialCharactersandSpace(value));

				}
			}

		});

		/** /
		this.ftemplatecomponent['componentName'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {

			//if( value !== '' ) {

			//	this.ftemplatecomponent['componentName'].patchValue( this.noSpecialCharactersandSpace(value) );

			//}

		});
		/**/

	}

	private noSpecialCharactersandSpace ( str:string ):string {

		return str.replace(/[^\w]/gi, '_');
		//return str.replace(/[^A-Z0-9]+/ig, "_");

	}

	private getRandomArbitrary(min:number, max:number) {
		return Math.random() * (max - min) + min;
	}

	private resetForm() {

		this.prepareForm();

		this.uploadedItem = null;
	}

	public DragAndDropEventItem(newItem: any) {

		//console.log('uploadItem:', newItem);

		if (!newItem || !newItem.data[0]) return;

		this.uploadComplete = true;

		// always send last item in Array
		this.uploadedItem = newItem.data[(newItem.data.length - 1)];
		//console.warn('uploadItem:', newItem, this.FormGroupComponentMeta.value );

	}

	public resetAssets(banner:any) {
		this.ResetEvent.emit(banner);

		this.resetVariationsSubject.next({
			stage: 'bannerCanvas-' + banner.bannersize.width + '-' + banner.bannersize.height,
			banner: banner
		});

		//this.uploadedFiles = [];
	}

	public removeAsset(removeItem:any) {

		//console.log('removeAsset:', removeItem );
		//console.log('uploadedFiles:', this.uploadedFiles );

		this.RemoveUploadEvent.emit(removeItem);

		/** /
		this.ResetEvent.emit(banner);

		this.resetVariationsSubject.next({
			stage: 'bannerCanvas-' + banner.bannersize.width + '-' + banner.bannersize.height,
			banner: banner
		});

		this.uploadedFiles = [];
		/**/
	}

	/**
	 * Prepare component meta data for FDCEvent and EditComponentEvent Events
	 * which pass data to the Page.component and banner.creator.directive for NEW Components.
	 *
	 */
	private setupNewComponentMetaData() {
		let componentMetaData: any;

		if( this.formDataComponentType.name === 'Text' ) {

			componentMetaData = {
				width: this.FormGroupComponentMeta.value['componentWidth'],
				height: this.FormGroupComponentMeta.value['componentHeight'],
				zIndex: this.FormGroupComponentMeta.value['zIndex'],
				positionY: this.FormGroupComponentMeta.value['positionY'],
				positionX: this.FormGroupComponentMeta.value['positionX'],
				fontFamilyId: this.FormGroupComponentMeta.value['fontFamilyId'],
				fontFamily: this.FormGroupComponentMeta.value['fontFamily'],
				fontWeight: this.FormGroupComponentMeta.value['fontWeight'],
				fontStyle: this.FormGroupComponentMeta.value['fontStyle'],
				fontColour: this.FormGroupComponentMeta.value['fontColour'],
				fontLineHeight: this.FormGroupComponentMeta.value['fontLineHeight'],
				fontSize: this.FormGroupComponentMeta.value['fontSize'],
				fontValue: this.FormGroupComponentMeta.value['fontValue'],
				textAlign: this.FormGroupComponentMeta.value['textAlign']
			}

		} else if( this.formDataComponentType.name === 'Image' ) {

			if (this.uploadedItem === null || this.uploadedItem === undefined) {
				this.alertService.error('Please upload image');
				return;

			}

			/** /
			const imageDataUri = async () => {
				const a = await this.getDataURI( this.uploadedItem );
				console.log('imageDataUri:', a);
				return a;
			};
			/**/

			componentMetaData = {
				zIndex: this.FormGroupComponentMeta.value['zIndex'],
				width: this.FormGroupComponentMeta.value['componentWidth'],
				height: this.FormGroupComponentMeta.value['componentHeight'],
				positionY: this.FormGroupComponentMeta.value['positionY'],
				positionX: this.FormGroupComponentMeta.value['positionX'],
				dataFileName: this.uploadedItem.name,
				dataFile: this.uploadedItem
				//dataFile: (async () => {await this.getDataURI(this.uploadedItem)})
			}

		} else if( this.formDataComponentType.name === 'Button' ) {

			componentMetaData = {
				width: this.FormGroupComponentMeta.value['componentWidth'],
				height: this.FormGroupComponentMeta.value['componentHeight'],
				zIndex: this.FormGroupComponentMeta.value['zIndex'],
				positionY: this.FormGroupComponentMeta.value['positionY'],
				positionX: this.FormGroupComponentMeta.value['positionX'],
				fontFamilyId: this.FormGroupComponentMeta.value['fontFamilyId'],
				fontFamily: this.FormGroupComponentMeta.value['fontFamily'],
				fontWeight: this.FormGroupComponentMeta.value['fontWeight'],
				fontStyle: this.FormGroupComponentMeta.value['fontStyle'],
				fontColour: this.FormGroupComponentMeta.value['fontColour'],
				fontLineHeight: this.FormGroupComponentMeta.value['fontLineHeight'],
				fontSize: this.FormGroupComponentMeta.value['fontSize'],
				fontValue: this.FormGroupComponentMeta.value['fontValue'],
				textAlign: this.FormGroupComponentMeta.value['textAlign'],
				shapeColour: this.FormGroupComponentMeta.value['shapeColour'],
				shapeRadiusTL: this.FormGroupComponentMeta.value['shapeRadiusTL'],
				shapeRadiusTR: this.FormGroupComponentMeta.value['shapeRadiusTR'],
				shapeRadiusBR: this.FormGroupComponentMeta.value['shapeRadiusBR'],
				shapeRadiusBL: this.FormGroupComponentMeta.value['shapeRadiusBL'],
				shapePaddingTop: this.FormGroupComponentMeta.value['shapePaddingTop'],
				shapePaddingRight: this.FormGroupComponentMeta.value['shapePaddingRight'],
				shapePaddingBottom: this.FormGroupComponentMeta.value['shapePaddingBottom'],
				shapePaddingLeft: this.FormGroupComponentMeta.value['shapePaddingLeft']
			}

		} else {

			componentMetaData = {
				zIndex: this.FormGroupComponentMeta.value['zIndex'],
				width: this.FormGroupComponentMeta.value['componentWidth'],
				height: this.FormGroupComponentMeta.value['componentHeight'],
				shapeColour: this.FormGroupComponentMeta.value['shapeColour'],
				positionY: this.FormGroupComponentMeta.value['positionY'],
				positionX: this.FormGroupComponentMeta.value['positionX'],
			}

		}

		return componentMetaData;
	}

	/**
	 * Linked to Button onClick
	 *
	 * Triggers FDCEvent which is bound to
	 * addComponent() method in add.edit.template.banner.page.ts component which
	 * pushes the new component as the latest value of newComponentSubject Observable (newComponentObs).
	 * newComponentObs is subscribed to banner.creator.directive.ts
	 *
	 */
	private broadcastUpdatedComponentInputChanges( newComponent: any ) {

		console.log('Broadcase New Component:', newComponent);

		// addImage/Text/Shape functions in Banner.creator expect an object and not an array of objects
		//newComponent.componentmeta = this.setupNewComponentMetaData();

		this.FDCEvent.emit(newComponent);
	}

	/**
	 * Linked to Button onClick
	 *
	 */
	public addComponentToCanvas() {

		this.loading = true;

		// stop here if form is invalid
		if (this.FormGroupComponentMeta.invalid) {
			console.error('Adding Component:', this.FormGroupComponentMeta.value, this.FormGroupComponentMeta.invalid, this.FormGroupComponentMeta);

			this.alertService.error('Please ensure you\'ve completed all the form fields\nfor ' + this.FormGroupComponentMeta.value['componentName']);

			this.loading = false;
			return;
		}

		this.saveComponentFromCanvas();

		this.loading = false;

		//this.resetForm();

	}

	/**
	 * Save a newly added component to the database.
	 *
	 */
	private saveComponentFromCanvas() {

		// stop here if form is invalid
		if (this.FormGroupComponentMeta.invalid) {
			this.alertService.error('Please ensure all the Component Fields are completed correctly.');
			console.error('Saving Component:', this.FormGroupComponentMeta.value, this.FormGroupComponentMeta.invalid);
			return;
		}

		this.loading = true;

		const newComponent = {
			name: this.FormGroupComponentMeta.value['componentName'],
			description: 'N/A',
			smart: false,
			status: true,
			componenttypeId: this.formDataComponentType.id,
			containerId: this.dataBannerContainerId,
			componentmeta: this.setupNewComponentMetaData()
		}

		/** /
		const filePath = 'client-id-' + this.dataTemplate.clientId + '/template-id-' +this.dataTemplate.id + '/banner-id-' + this.dataBanner.id + '/container-id-' + this.dataBannerContainerId;

		console.warn('Saving New Component:', newComponent );
		console.warn('filePath:', filePath );

		return;
		/**/

		if( this.formDataComponentType.name === 'Image' ) {

			const filePath = 'client-id-' + this.dataTemplate.clientId + '/template-id-' +this.dataTemplate.id + '/banner-id-' + this.dataBanner.id + '/container-id-' + this.dataBannerContainerId; //+ '/' + this.formDataComponentType.componentmeta.dataFileName;

			this.componentService.upload( {
				'file': newComponent.componentmeta.dataFile,
				'path': filePath
			})
			.pipe(first())
			.subscribe({
				next: (results:any) => {

					newComponent.componentmeta.dataFilePath = results.data;

					//return;

					this.componentService.create( newComponent )
						.pipe(first())
						.subscribe({
							next: (newComponentDb:any) => {
								this.loading = false;
								this.alertService.success( newComponent.name + ' Saved successfully.', { keepAfterRouteChange: false });

								//const componentMetaData = this.setupNewComponentMetaData();
								this.broadcastUpdatedComponentInputChanges( newComponentDb );
							},
							error: error => {
								this.loading = false;
								this.alertService.error(error);
							}
						});
				},
				error: error => {
					this.loading = false;
					this.alertService.error(error);
				}
			});

		} else {

			this.componentService.create( newComponent )
				.pipe(first())
				.subscribe({
					next: (newComponentDb:any) => {
						this.loading = false;
						this.alertService.success( newComponent.name + ' Saved successfully.', { keepAfterRouteChange: false });

						//const componentMetaData = this.setupNewComponentMetaData();
						this.broadcastUpdatedComponentInputChanges( newComponentDb );
					},
					error: error => {
						this.loading = false;
						this.alertService.error(error);

					}
				});

		}
	}

}
