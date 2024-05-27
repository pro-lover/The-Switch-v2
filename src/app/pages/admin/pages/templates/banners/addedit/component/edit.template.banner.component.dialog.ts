
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent } from '@app/components';
import { Banner, FontType, Template } from '@app/core/models';
import { AlertService, ComponentService, FontTypeService } from '@app/core/services';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-component-edit',
	templateUrl: './edit.template.banner.component.dialog.html',
	styleUrls: ['./edit.template.banner.component.dialog.scss'],
})
export class TemplateBannerEditDialogComponent implements OnInit, OnDestroy {

	// will use the _destroy$ observable to control
	// fetching items from an observable
	private _destroy$ = new Subject<boolean>();

	//public id!: string;
	//public isAddMode!: boolean;
	public loading = false;
	public submitted = false;
	public changesHaveBeenSaved = true;

	//
	@Input() dataBanner!: Banner;
	@Input() dataTemplate!: Template;
	@Input() dataContainerId!: string;

	// Drag and Drop
	@Output() FDCEvent = new EventEmitter<any>();
	public uploadComplete = false;
	private uploadedItem: any;
	private uploadedFileSubject: BehaviorSubject<any[] | unknown>;
	public uploadedFileObs: Observable<any[] | unknown>;


	// listening to drag and drop events from Banner.creator component passed through the add.edit.template.banner.page.ts
	@Input() componentPositionUpdate!: any;

	@Output() EditComponentEvent = new EventEmitter<any>();
	@Output() DeleteComponentEvent = new EventEmitter<any>();
	// close edit dialog event
	@Output() EditComponentcloseEvent = new EventEmitter<any>();

	@Output() ResetEvent = new EventEmitter<any>();
	@Output() RemoveUploadEvent = new EventEmitter<any>();

	private resetVariationsSubject: BehaviorSubject<any>;
	public resetVariationsObs: Observable<any>;

	//wait for component to be emitted
	@Input()EditActiveComponentReceived!: any;
	public EditActiveComponent:any;

	@Input()UpdatedComponentPositionReceived!: any;

	// component meta data form
	public FormGroupEditComponentMeta!: FormGroup;

	// toggle edit canvas controls
	private editableComponentsSubject: BehaviorSubject<boolean>;
	public editableComponentsObs: Observable<boolean>;

	//
	public fontFamilies: FontType[] = [];

	//public FormGroupEditComponentMeta!: FormGroup;

	constructor(
		private dialog: MatDialog,
		private formBuilder: FormBuilder,
		private fontTypeService: FontTypeService,
		private alertService: AlertService,
		private componentService: ComponentService
	) {

		this.editableComponentsSubject = new BehaviorSubject<boolean>(false);
		this.editableComponentsObs = this.editableComponentsSubject.asObservable();

		this.uploadedFileSubject = new BehaviorSubject<any[] | unknown>(null);
		this.uploadedFileObs = this.uploadedFileSubject.asObservable();

		this.resetVariationsSubject = new BehaviorSubject<boolean>(false);
		this.resetVariationsObs = this.resetVariationsSubject.asObservable();
	}

	// convenience getter for easy access to form fields for editing components data
	get ftemplateeditcomponent() { return this.FormGroupEditComponentMeta.controls; }

	ngOnInit() {

		//this.isAddMode = false;

		this.EditActiveComponentReceived.pipe(takeUntil(this._destroy$)).subscribe((evt:any) => {

			this.fontTypeService.fontType.pipe(takeUntil(this._destroy$)).subscribe((data: FontType[]) => {
				if( data !== null ) {
					this.fontFamilies = data;
				}
			});

			this.initialise(evt);
		});

		this.UpdatedComponentPositionReceived.pipe(takeUntil(this._destroy$)).subscribe((evt:any) => {

			//console.log('UpdatedComponentPositionReceived:', evt);

			this.updateEditFormValues(evt.component.meta);

		});

	}

	ngOnDestroy(): void {
		console.warn('Template Banner Component Dialog ngOnDestroy');
		this._destroy$.next(false);
		this._destroy$.complete();
	}

	public initialise( event:any ):void {

		if (!event) return;

		//console.log('EditActiveComponentsEdit', event);

		this.EditActiveComponent = event;

		this.prepareEditFormValues();

		this.listenToComponentFormInputChanges();

	}

	public DragAndDropEventItem(newItem: any) {

		//console.log('uploadItem:', newItem);

		if (!newItem || !newItem.data[0]) return;

		this.uploadComplete = true;

		// always send last item in Array
		this.uploadedItem = newItem.data[(newItem.data.length - 1)];
		//console.warn('uploadItem:', newItem, this.FormGroupComponentMeta.value );

		//this.changesHaveBeenSaved = false;
		this.FormGroupEditComponentMeta.markAsDirty();

		//if (!this.isAddMode || this.componentId === 0) {

			const componentMetaData = this.setupUpdatedComponentMetaData();

			this.broadcastUpdatedComponentInputChanges(componentMetaData);

		//}
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
	 * Prepare Form variables for editing a component
	 *
	 */
	private prepareEditFormValues() {

		if( this.EditActiveComponent.componenttype.name === 'Text' ) {

			this.FormGroupEditComponentMeta = this.formBuilder.group({
				componentId: [this.EditActiveComponent.id, Validators.required],
				containerId: [this.EditActiveComponent.containerId, Validators.required],
				componentName: [this.EditActiveComponent.name, Validators.required],
				componentTypeId: [this.EditActiveComponent.componenttypeId, Validators.required],
				componentTypeName: [this.EditActiveComponent.componenttype.name, Validators.required],
				zIndex: ['', Validators.required],
				positionY: ['', Validators.required],
				positionX: ['', Validators.required],
				width: ['', Validators.required],
				height: ['', Validators.required],
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

			this.FormGroupEditComponentMeta.patchValue({
				width: parseInt(this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'width').value),
				height: parseInt(this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'height').value),
				positionX: parseInt(this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'positionX').value),
				positionY: parseInt(this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'positionY').value),
				zIndex: parseInt(this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'zIndex').value),
				fontFamilyId: this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'fontFamilyId').value,
				fontFamily: this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'fontFamily').value,
				fontWeight: this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'fontWeight').value,
				fontStyle: this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'fontStyle').value,
				fontSize: parseInt(this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'fontSize').value),
				fontLineHeight: parseInt(this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'fontLineHeight').value),
				fontColour: this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'fontColour').value,
				fontValue: this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'fontValue').value,
				textAlign:  this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'textAlign').value
			});

		} else if( this.EditActiveComponent.componenttype.name === 'Button' ) {

			this.FormGroupEditComponentMeta = this.formBuilder.group({
				componentId: [this.EditActiveComponent.id, Validators.required],
				containerId: [this.EditActiveComponent.containerId, Validators.required],
				componentName: [this.EditActiveComponent.name, Validators.required],
				componentTypeId: [this.EditActiveComponent.componenttypeId, Validators.required],
				componentTypeName: [this.EditActiveComponent.componenttype.name, Validators.required],
				zIndex: ['', Validators.required],
				positionY: ['', Validators.required],
				positionX: ['', Validators.required],
				width: ['', Validators.required],
				height: ['', Validators.required],
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
				shapeRadiusTL: ['',
					[
						Validators.required,
						Validators.minLength(0)
					]
				],
				shapeRadiusTR: ['',
					[
						Validators.required,
						Validators.minLength(0)
					]
				],
				shapeRadiusBR: ['',
					[
						Validators.required,
						Validators.minLength(0)
					]
				],
				shapeRadiusBL: ['',
					[
						Validators.required,
						Validators.minLength(0)
					]
				],
				shapePaddingTop: ['',
					[
						Validators.required,
						Validators.minLength(0)
					]
				],
				shapePaddingRight: ['',
					[
						Validators.required,
						Validators.minLength(0)
					]
				],
				shapePaddingBottom: ['',
					[
						Validators.required,
						Validators.minLength(0)
					]
				],
				shapePaddingLeft: ['',
					[
						Validators.required,
						Validators.minLength(0)
					]
				]
			});

			this.FormGroupEditComponentMeta.patchValue({
				width: parseInt(this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'width').value),
				height: parseInt(this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'height').value),
				positionX: parseInt(this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'positionX').value),
				positionY: parseInt(this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'positionY').value),
				zIndex: parseInt(this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'zIndex').value),
				fontFamilyId: this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'fontFamilyId').value,
				fontFamily: this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'fontFamily').value,
				fontWeight: this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'fontWeight').value,
				fontStyle: this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'fontStyle').value,
				fontSize: parseInt(this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'fontSize').value),
				fontLineHeight: parseInt(this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'fontLineHeight').value),
				fontColour: this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'fontColour').value,
				fontValue: this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'fontValue').value,
				textAlign:  this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'textAlign').value,
				shapeColour:  this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'shapeColour').value,
				shapeRadiusTL:  this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'shapeRadiusTL').value,
				shapeRadiusTR:  this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'shapeRadiusTR').value,
				shapeRadiusBR:  this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'shapeRadiusBR').value,
				shapeRadiusBL:  this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'shapeRadiusBL').value,
				shapePaddingTop:  this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'shapePaddingTop').value,
				shapePaddingRight:  this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'shapePaddingRight').value,
				shapePaddingBottom:  this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'shapePaddingBottom').value,
				shapePaddingLeft:  this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'shapePaddingLeft').value
			});

		} else if( this.EditActiveComponent.componenttype.name === 'Shape' ) {

			this.FormGroupEditComponentMeta = this.formBuilder.group({
				componentId: [this.EditActiveComponent.id, Validators.required],
				containerId: [this.EditActiveComponent.containerId, Validators.required],
				componentName: [this.EditActiveComponent.name, Validators.required],
				componentTypeId: [this.EditActiveComponent.componenttypeId, Validators.required],
				componentTypeName: [this.EditActiveComponent.componenttype.name, Validators.required],
				shapeColour: ['', Validators.required],
				zIndex: ['', Validators.required],
				positionY: ['', Validators.required],
				positionX: ['', Validators.required],
				width: ['', Validators.required],
				height: ['', Validators.required],
			});

			this.FormGroupEditComponentMeta.patchValue({
				width: parseInt(this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'width').value),
				height: parseInt(this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'height').value),
				positionX: parseInt(this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'positionX').value),
				positionY: parseInt(this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'positionY').value),
				zIndex: parseInt(this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'zIndex').value),
				shapeColour: this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'shapeColour').value
			});

		} else {

			this.FormGroupEditComponentMeta = this.formBuilder.group({
				componentId: [this.EditActiveComponent.id, Validators.required],
				containerId: [this.EditActiveComponent.containerId, Validators.required],
				componentName: [this.EditActiveComponent.name, Validators.required],
				componentTypeId: [this.EditActiveComponent.componenttypeId, Validators.required],
				componentTypeName: [this.EditActiveComponent.componenttype.name, Validators.required],
				zIndex: ['', Validators.required],
				positionY: ['', Validators.required],
				positionX: ['', Validators.required],
				width: ['', Validators.required],
				height: ['', Validators.required],
			});

			this.FormGroupEditComponentMeta.patchValue({
				width: parseInt(this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'width').value),
				height: parseInt(this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'height').value),
				positionX: parseInt(this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'positionX').value),
				positionY: parseInt(this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'positionY').value),
				zIndex: parseInt(this.EditActiveComponent.componentmeta.find((x:any) => x.name === 'zIndex').value)
			});

		}

		if( this.EditActiveComponent.componenttype.name === 'Text' || this.EditActiveComponent.componenttype.name === 'Button' ) {

			this.ftemplateeditcomponent['fontFamilyId'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value: string) => {

				//console.log('fontFamily:', parseInt(value), this.fontFamilies);

				this.fontFamilies.find( (font) => {
					if( parseInt(font.id) === parseInt(value) ) {
						///console.log('fontFamily:', font);
						this.ftemplateeditcomponent['fontFamily'].patchValue(font.fontFamily);
						this.ftemplateeditcomponent['fontWeight'].patchValue(font.fontWeight);
						this.ftemplateeditcomponent['fontStyle'].patchValue(font.fontStyle);
					}
				});

			});
		}

	}

	private updateEditFormValues(componentmeta:any):void {

		this.changesHaveBeenSaved = false;
		this.FormGroupEditComponentMeta.markAsDirty();

		this.FormGroupEditComponentMeta.patchValue({
			positionY: componentmeta.positionY,
			positionX: componentmeta.positionX,
		});

	}

	/**
	 * Prepare component meta data for FDCEvent and EditComponentEvent Events
	 * which pass data to the Page.component and banner.creator.directive for EXISTING Components.
	 *
	 */
	private setupUpdatedComponentMetaData() {
		let componentMetaData: any;

		if( this.EditActiveComponent.componenttype.name === 'Text' ) {

			componentMetaData = {
				width: this.FormGroupEditComponentMeta.value['width'],
				height: this.FormGroupEditComponentMeta.value['height'],
				zIndex: this.FormGroupEditComponentMeta.value['zIndex'],
				positionY: this.FormGroupEditComponentMeta.value['positionY'],
				positionX: this.FormGroupEditComponentMeta.value['positionX'],
				fontFamilyId: this.FormGroupEditComponentMeta.value['fontFamilyId'],
				fontFamily: this.FormGroupEditComponentMeta.value['fontFamily'],
				fontWeight: this.FormGroupEditComponentMeta.value['fontWeight'],
				fontStyle: this.FormGroupEditComponentMeta.value['fontStyle'],
				fontColour: this.FormGroupEditComponentMeta.value['fontColour'],
				fontLineHeight: this.FormGroupEditComponentMeta.value['fontLineHeight'],
				fontSize: this.FormGroupEditComponentMeta.value['fontSize'],
				fontValue: this.FormGroupEditComponentMeta.value['fontValue'],
				textAlign: this.FormGroupEditComponentMeta.value['textAlign']
			}

		} else if( this.EditActiveComponent.componenttype.name === 'Button' ) {

			componentMetaData = {
				width: this.FormGroupEditComponentMeta.value['width'],
				height: this.FormGroupEditComponentMeta.value['height'],
				zIndex: this.FormGroupEditComponentMeta.value['zIndex'],
				positionY: this.FormGroupEditComponentMeta.value['positionY'],
				positionX: this.FormGroupEditComponentMeta.value['positionX'],
				fontFamilyId: this.FormGroupEditComponentMeta.value['fontFamilyId'],
				fontFamily: this.FormGroupEditComponentMeta.value['fontFamily'],
				fontWeight: this.FormGroupEditComponentMeta.value['fontWeight'],
				fontStyle: this.FormGroupEditComponentMeta.value['fontStyle'],
				fontColour: this.FormGroupEditComponentMeta.value['fontColour'],
				fontLineHeight: this.FormGroupEditComponentMeta.value['fontLineHeight'],
				fontSize: this.FormGroupEditComponentMeta.value['fontSize'],
				fontValue: this.FormGroupEditComponentMeta.value['fontValue'],
				textAlign: this.FormGroupEditComponentMeta.value['textAlign'],
				shapeColour: this.FormGroupEditComponentMeta.value['shapeColour'],
				shapeRadiusTL: this.FormGroupEditComponentMeta.value['shapeRadiusTL'],
				shapeRadiusTR: this.FormGroupEditComponentMeta.value['shapeRadiusTR'],
				shapeRadiusBR: this.FormGroupEditComponentMeta.value['shapeRadiusBR'],
				shapeRadiusBL: this.FormGroupEditComponentMeta.value['shapeRadiusBL'],
				shapePaddingTop: this.FormGroupEditComponentMeta.value['shapePaddingTop'],
				shapePaddingRight: this.FormGroupEditComponentMeta.value['shapePaddingRight'],
				shapePaddingBottom: this.FormGroupEditComponentMeta.value['shapePaddingBottom'],
				shapePaddingLeft: this.FormGroupEditComponentMeta.value['shapePaddingLeft']
			}

		} else if( this.EditActiveComponent.componenttype.name === 'Image' ) {

			if (this.uploadedItem === null || this.uploadedItem === undefined) {
				//this.alertService.error('Please upload image');
				//return;
				componentMetaData = {
					zIndex: this.FormGroupEditComponentMeta.value['zIndex'],
					width: this.FormGroupEditComponentMeta.value['width'],
					height: this.FormGroupEditComponentMeta.value['height'],
					positionY: this.FormGroupEditComponentMeta.value['positionY'],
					positionX: this.FormGroupEditComponentMeta.value['positionX']
				}

			} else {

				componentMetaData = {
					zIndex: this.FormGroupEditComponentMeta.value['zIndex'],
					width: this.FormGroupEditComponentMeta.value['width'],
					height: this.FormGroupEditComponentMeta.value['height'],
					positionY: this.FormGroupEditComponentMeta.value['positionY'],
					positionX: this.FormGroupEditComponentMeta.value['positionX'],
					dataFileName: this.uploadedItem.name,
					dataFile: this.uploadedItem
					//dataFile: (async () => {await this.getDataURI(this.uploadedItem)})
				}
			}

		} else {

			componentMetaData = {
				zIndex: this.FormGroupEditComponentMeta.value['zIndex'],
				width: this.FormGroupEditComponentMeta.value['width'],
				height: this.FormGroupEditComponentMeta.value['height'],
				shapeColour: this.FormGroupEditComponentMeta.value['shapeColour'],
				positionY: this.FormGroupEditComponentMeta.value['positionY'],
				positionX: this.FormGroupEditComponentMeta.value['positionX'],
			}

		}

		return componentMetaData;
	}

	private listenToComponentFormInputChanges() {

		// listening to drag and drop events from Banner.creator component passed through the add.edit.template.banner.page.ts
		/** /
		this.componentPositionUpdate.pipe(takeUntil(this._destroy$)).subscribe((evt:any) => {

			//console.warn( 'componentPositionUpdate::', evt, this.EditActiveComponent);
			//console.warn( 'componentPositionUpdate::', evt.component);

			/** /
			if ( evt.component.id === 0 && this.EditActiveComponent.name === evt.component.name ) {
				this.FormGroupEditComponentMeta.patchValue({
					positionX: evt.data.rawX.toFixed(2).toString(),
					positionY: evt.data.rawY.toFixed(2).toString()
				});
				console.warn( 'NEW componentPositionUpdate::', evt, this.FormGroupEditComponentMeta);
			}
			/** /

			if (!evt || !evt.component || !evt.component.id) return;

			if(
				this.EditActiveComponent.id === evt.component.id
				//this.componentId === evt.component.id
				//&& (this.dataBannerWidth === evt.component.bannerWidth && this.dataBannerHeight === evt.component.bannerHeight)
			) {

				console.warn( 'componentPositionUpdate::', evt);

				this.FormGroupEditComponentMeta.patchValue({
					positionX: evt.data.rawX.toFixed(2).toString(),
					positionY: evt.data.rawY.toFixed(2).toString()
				});

				//console.warn( 'componentPositionUpdate::', evt, this.FormGroupEditComponentMeta);
			}

		});
		/**/

		this.ftemplateeditcomponent['width'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {

			const componentMetaData = this.setupUpdatedComponentMetaData();

			componentMetaData.width = value;

			this.broadcastUpdatedComponentInputChanges(componentMetaData);

			//console.log('componentWidth:', value, this.componentId, componentMetaData);
		});

		this.ftemplateeditcomponent['height'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {

			const componentMetaData = this.setupUpdatedComponentMetaData();

			componentMetaData.height = value;

			this.broadcastUpdatedComponentInputChanges(componentMetaData);

			//console.log('componentWidth:', value, this.componentId, componentMetaData);
		});

		this.ftemplateeditcomponent['positionY'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {

			const componentMetaData = this.setupUpdatedComponentMetaData();

			componentMetaData.positionY = value;

			this.broadcastUpdatedComponentInputChanges(componentMetaData);

			//console.log('positionY:', value, this.componentId, componentMetaData);

		});

		this.ftemplateeditcomponent['positionX'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {
			//console.log('positionX:', value, this.componentId);

			const componentMetaData = this.setupUpdatedComponentMetaData();

			componentMetaData.positionX = value;

			this.broadcastUpdatedComponentInputChanges(componentMetaData);

		});

		this.ftemplateeditcomponent['zIndex'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {
			//console.log('positionX:', value, this.componentId);

			const componentMetaData = this.setupUpdatedComponentMetaData();

			componentMetaData.zIndex = value;

			this.broadcastUpdatedComponentInputChanges(componentMetaData);

		});

		if ( this.EditActiveComponent.componenttype.name === 'Text' || this.EditActiveComponent.componenttype.name == 'Button' ) {

			this.ftemplateeditcomponent['fontValue'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {

				const componentMetaData = this.setupUpdatedComponentMetaData();

				componentMetaData.fontValue = value;

				this.broadcastUpdatedComponentInputChanges(componentMetaData);

			});

			this.ftemplateeditcomponent['fontColour'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {

				const componentMetaData = this.setupUpdatedComponentMetaData();

				componentMetaData.fontColour = value;

				this.broadcastUpdatedComponentInputChanges(componentMetaData);

			});

			this.ftemplateeditcomponent['fontSize'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {

				const componentMetaData = this.setupUpdatedComponentMetaData();

				componentMetaData.fontSize = value;

				this.broadcastUpdatedComponentInputChanges(componentMetaData);

			});

			this.ftemplateeditcomponent['fontLineHeight'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {

				const componentMetaData = this.setupUpdatedComponentMetaData();

				componentMetaData.fontLineHeight = value;

				this.broadcastUpdatedComponentInputChanges(componentMetaData);

			});

			this.ftemplateeditcomponent['textAlign'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {

				const componentMetaData = this.setupUpdatedComponentMetaData();

				componentMetaData.textAlign = value;

				this.broadcastUpdatedComponentInputChanges(componentMetaData);
			});
		}

		if ( this.EditActiveComponent.componenttype.name === 'Shape' || this.EditActiveComponent.componenttype.name == 'Button' ) {

			this.ftemplateeditcomponent['shapeColour'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {

				const componentMetaData = this.setupUpdatedComponentMetaData();

				componentMetaData.shapeColour = value;

				this.broadcastUpdatedComponentInputChanges(componentMetaData);

			});
		}

		if ( this.EditActiveComponent.componenttype.name === 'Button') {

			this.ftemplateeditcomponent['shapeRadiusTL'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {

				const componentMetaData = this.setupUpdatedComponentMetaData();

				componentMetaData.shapeRadiusTL = value;

				this.broadcastUpdatedComponentInputChanges(componentMetaData);

			});

			this.ftemplateeditcomponent['shapeRadiusTR'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {

				const componentMetaData = this.setupUpdatedComponentMetaData();

				componentMetaData.shapeRadiusTR = value;

				this.broadcastUpdatedComponentInputChanges(componentMetaData);

			});

			this.ftemplateeditcomponent['shapeRadiusBR'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {

				const componentMetaData = this.setupUpdatedComponentMetaData();

				componentMetaData.shapeRadiusBR = value;

				this.broadcastUpdatedComponentInputChanges(componentMetaData);

			});

			this.ftemplateeditcomponent['shapeRadiusBL'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {

				const componentMetaData = this.setupUpdatedComponentMetaData();

				componentMetaData.shapeRadiusBL = value;

				this.broadcastUpdatedComponentInputChanges(componentMetaData);

			});

			this.ftemplateeditcomponent['shapePaddingTop'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {

				const componentMetaData = this.setupUpdatedComponentMetaData();

				componentMetaData.shapePaddingTop = value;

				this.broadcastUpdatedComponentInputChanges(componentMetaData);

			});

			this.ftemplateeditcomponent['shapePaddingRight'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {

				const componentMetaData = this.setupUpdatedComponentMetaData();

				componentMetaData.shapePaddingRight = value;

				this.broadcastUpdatedComponentInputChanges(componentMetaData);

			});

			this.ftemplateeditcomponent['shapePaddingBottom'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {

				const componentMetaData = this.setupUpdatedComponentMetaData();

				componentMetaData.shapePaddingBottom = value;

				this.broadcastUpdatedComponentInputChanges(componentMetaData);

			});

			this.ftemplateeditcomponent['shapePaddingLeft'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {

				const componentMetaData = this.setupUpdatedComponentMetaData();

				componentMetaData.shapePaddingLeft = value;

				this.broadcastUpdatedComponentInputChanges(componentMetaData);

			});

		}

	}

	private broadcastUpdatedComponentInputChanges( componentMetaData: any ) {

		//console.log('FormGroupEditComponentMeta', this.FormGroupEditComponentMeta);

		this.changesHaveBeenSaved = false;

		this.EditComponentEvent.emit({
			name: this.FormGroupEditComponentMeta.value['componentName'],
			description: this.EditActiveComponent.description,
			smart: this.EditActiveComponent.smart,
			componentId: this.EditActiveComponent.id,
			bannerSizeId: this.dataBanner.bannersize.id,
			bannerWidth: this.dataBanner.bannersize.width,
			bannerHeight: this.dataBanner.bannersize.height,
			componenttypeId: this.FormGroupEditComponentMeta.value['componentTypeId'],
			componenttypeName: this.FormGroupEditComponentMeta.value['componentTypeName'],
			componentmeta: componentMetaData,
			animation: [],

		});
	}

	public closeActiveComponentsEdit():void {

		if( this.haveChangesBeenSaved() === true ) {
			this.EditComponentcloseEvent.emit();
		} else {

			//this.alertService.info('Your Changes have not been saved, please save your changes before closing.');

			const confirmDialog = this.dialog.open( DialogConfirmComponent, {
				data: {
					title: 'Your Changes have not been saved.',
					message: 'Are you sure you want to continue and lose your updates?.'
				}
			});
			confirmDialog.afterClosed().subscribe(result => {
				if (result === true) {
					this.EditComponentcloseEvent.emit();
					this.alertService.info('Your Changes have not been saved.');
				}
			});
		}
	}

	public saveActiveComponentsEdit(id:string):void {

		if (this.FormGroupEditComponentMeta.invalid) {
			this.alertService.error('Please ensure all the Component Fields are completed correctly.');
			console.error('Error Saving Component:', this.FormGroupEditComponentMeta.value);
			return;
		}

		//console.log('saveActiveComponentsEdit', this.EditActiveComponent, this.FormGroupEditComponentMeta.value);

		this.EditActiveComponent.isSaving = true;

		const confirmDialog = this.dialog.open( DialogConfirmComponent, {
			data: {
				title: 'Confirm Update Action',
				message: 'Are you sure you want to update: ' + this.EditActiveComponent.name + '?.'
			}
		});
		confirmDialog.afterClosed().subscribe(result => {
			if (result === true) {

				this.saveUpdatedComponentToDB(id);

			} else {
				console.info('Cancel Updating ID:', id);

				this.EditActiveComponent.isSaving = false;
			}
		});
	}

	private saveUpdatedComponentToDB(id:string) {

		const newMeta = {
			componentmeta: this.setupUpdatedComponentMetaData()//this.FormGroupEditComponentMeta.value
		}

		//console.info('saveUpdatedComponentToDB:', this.EditActiveComponent);

		if( this.EditActiveComponent.componenttype.name === 'Image' ) {

			if(  newMeta.componentmeta.dataFile === undefined ) {
				// image asset not updated
				this.componentService.updateComponentMeta( id, newMeta)
					.pipe(first())
					.subscribe({
						next: () => {
							this.EditActiveComponent.isSaving = false;
							this.alertService.success( this.EditActiveComponent.name + ' Update successful', { keepAfterRouteChange: false });

							this.changesHaveBeenSaved = true;
						},
						error: error => {
							this.EditActiveComponent.isSaving = false;
							this.alertService.error(error);

							this.changesHaveBeenSaved = true;

						}
					});

			} else {

				// image asset updated
				const filePath = 'client-id-' + this.dataTemplate.clientId + '/template-id-' +this.dataTemplate.id + '/banner-id-' + this.dataBanner.id + '/container-id-' + this.dataContainerId;

				this.componentService.upload( {
					'file': newMeta.componentmeta.dataFile,
					'path': filePath
				})
				.pipe(first())
				.subscribe({
					next: (results:any) => {

						newMeta.componentmeta.dataFilePath = results.data;

						//return;

						this.componentService.updateComponentMeta( id, newMeta)
							.pipe(first())
							.subscribe({
								next: () => {
									this.EditActiveComponent.isSaving = false;
									this.alertService.success( this.EditActiveComponent.name + ' Update successful', { keepAfterRouteChange: false });

									newMeta.componentmeta.path = results.data;
									newMeta.componentmeta.newimage = true;

									//delete newMeta.componentmeta.dataFilePath

									this.broadcastUpdatedComponentInputChanges(newMeta.componentmeta);

									this.changesHaveBeenSaved = true;
								},
								error: error => {
									this.EditActiveComponent.isSaving = false;
									this.alertService.error(error);
									this.changesHaveBeenSaved = false;
								}
							});

					},
					error: error => {
						this.EditActiveComponent.isSaving = false;
						this.alertService.error(error);
						this.changesHaveBeenSaved = false;
					}
				});

			}

		} else {

			this.componentService.updateComponentMeta( id, newMeta)
					.pipe(first())
					.subscribe({
						next: () => {

							//console.log('saveUpdatedComponentToDB complete', this.EditActiveComponent);

							this.alertService.success(  this.EditActiveComponent.name + ' updated successfully.', { keepAfterRouteChange: true });

							this.EditActiveComponent.isSaving = false;

							this.changesHaveBeenSaved = true;

						},
						error: (error:string) => {
							this.alertService.error(error);
							this.EditActiveComponent.isSaving = false;

							this.changesHaveBeenSaved = false;
						}
					});
		}
	}

	public deleteActiveComponentsEdit(id:string):void {

		//console.log('deleteActiveComponentsEdit', this.EditActiveComponent, this.FormGroupEditComponentMeta.value);

		this.EditActiveComponent.isDeleting = true;

		//return;

		const confirmDialog = this.dialog.open( DialogConfirmComponent, {
			data: {
				title: 'Confirm Delete Action',
				message: 'Are you sure you want to delete: ' + this.EditActiveComponent.name + '?.'
			}
		});
		confirmDialog.afterClosed().subscribe(result => {
			if (result === true) {

				/** /
				this.EditActiveComponent.isDeleting = false;
				this.alertService.info(  'Testing Component ' + this.EditActiveComponent.name + ' deletion.', { keepAfterRouteChange: true });
				this.DeleteComponentEvent.emit(this.EditActiveComponent);
				this.EditComponentcloseEvent.emit();
				return;
				/**/

				this.removeComponentFromDbAndCanvas();

			} else {
				console.info('Cancel Deleting ID:', id);

				this.EditActiveComponent.isDeleting = false;
			}
		});
	}

	private removeComponentFromDbAndCanvas() {

		if( this.EditActiveComponent.id !== 0 ) {

			this.componentService.delete( this.EditActiveComponent.id )
				.pipe(first())
				.subscribe({
					next: () => {
						this.EditActiveComponent.isDeleting = false;
						this.alertService.success( this.EditActiveComponent.name + ' deleted successfully.', { keepAfterRouteChange: false });
						this.DeleteComponentEvent.emit(this.EditActiveComponent);
						this.EditComponentcloseEvent.emit();
					},
					error: error => {
						this.EditActiveComponent.isDeleting = false;
						this.alertService.error(error);

					}
				});

		} else {
			this.DeleteComponentEvent.emit(this.EditActiveComponent);
			this.EditActiveComponent.isDeleting = false;
			this.EditComponentcloseEvent.emit();
		}

	}

	public toggleSmartComponent(event:any, id: string):void {
		this.updateSmartStatus(id, {
			status: event.checked
		});
	}

	private updateSmartStatus( id: string, params: any ):void {

		this.componentService.updateSmartStatus(id, params)
			.pipe(first())
			.subscribe({
				next: () => {
					this.alertService.success('Component Smart Status changed successfully', { keepAfterRouteChange: true });

					this.EditComponentEvent.emit({
						name: this.FormGroupEditComponentMeta.value['componentName'],
						description: this.EditActiveComponent.description,
						smart: params.status,
						componentId: this.EditActiveComponent.id,
						bannerSizeId: this.dataBanner.bannersize.id,
						bannerWidth: this.dataBanner.bannersize.width,
						bannerHeight: this.dataBanner.bannersize.height,
						componenttypeId: this.FormGroupEditComponentMeta.value['componentTypeId'],
						componenttypeName: this.FormGroupEditComponentMeta.value['componentTypeName'],
						componentmeta: this.setupUpdatedComponentMetaData(),
						animation: [],
					});
				},
				error: error => {
					this.alertService.error(error);
				}
			});
	}

	private haveChangesBeenSaved():boolean {
		if( this.FormGroupEditComponentMeta.dirty === true && this.changesHaveBeenSaved === false ) {
			return false;
		} else {
			return true;
		}
	}

}
