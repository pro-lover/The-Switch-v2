
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent } from '@app/components';
import { Container } from '@app/core/models';
import { AlertService, AnimationService, AnimationTypeService, EasingTypeService } from '@app/core/services';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { first, map, takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-component-animation-edit',
	templateUrl: './edit.template.banner.component.animation.dialog.html',
	styleUrls: ['./edit.template.banner.component.animation.dialog.scss'],
})
export class TemplateBannerAnimationEditDialogComponent implements OnInit, OnDestroy {

	// will use the _destroy$ observable to control
	// fetching items from an observable
	private _destroy$ = new Subject<boolean>();

	//public id!: string;
	//public isAddMode!: boolean;
	public loading = false;
	public submitted = false;
	public changesHaveBeenSaved = true;

	public pageData$!:Observable<any>;

	public formDataAnimations:any = [];
	public formDataAnimationTypes:any = [];
	public formDataEasingTypes:any = [];

	//
	@Input() dataContainer!: Container;
	@Input() EditActiveAnimation!: any;


	// listening to drag and drop events from Banner.creator component passed through the add.edit.template.banner.page.ts
	@Input() componentAnimationPositionUpdateReceived!: any;

	@Output() EditAnimationEvent = new EventEmitter<any>();
	@Output() DeleteAnimationEvent = new EventEmitter<any>();
	// close edit dialog event
	@Output() EditAnimationcloseEvent = new EventEmitter<any>();

	// component meta data form
	public FormGroupAnimationData!: FormGroup;
	public FormGroupAnimationMetaData!: FormGroup

	// toggle edit canvas controls
	private editableAnimationSubject: BehaviorSubject<boolean>;
	public editableAnimationObs: Observable<boolean>;

	//
	constructor(
		private dialog: MatDialog,
		private formBuilder: FormBuilder,
		private animationService: AnimationService,
		private easingTypeService: EasingTypeService,
		private animationTypeService: AnimationTypeService,
		private alertService: AlertService
	) {


		this.editableAnimationSubject = new BehaviorSubject<boolean>(false);
		this.editableAnimationObs = this.editableAnimationSubject.asObservable();

	}

	ngOnInit() {

		console.log('EditActiveAnimation:', this.EditActiveAnimation);

		this.prepareEditFormValues();
		//this.isAddMode = false;

		this.initialise();

		this.componentAnimationPositionUpdateReceived.pipe(takeUntil(this._destroy$)).subscribe((evt:any) => {

			//console.warn('componentAnimationPositionUpdateReceived:', evt);
			this.updateEditFormValues(evt.posData.val/1000);
		});

		/** /
		this.EditActiveAnimationReceived.pipe(takeUntil(this._destroy$)).subscribe((evt:any) => {

			console.log('EditActiveAnimationReceived:', evt);
			this.EditActiveAnimationsEdit(evt);
		});
		/**/

	}

	// convenience getter for easy access to form fields for editing components data
	get fcomponentanimation() { return this.FormGroupAnimationData.controls; }
	get fcomponentanimationmeta() { return this.FormGroupAnimationMetaData.controls; }

	ngOnDestroy(): void {
		console.warn('Template Banner Component Animation Dialog ngOnDestroy');
		this._destroy$.next(false);
		this._destroy$.complete();
	}

	private initialise():void {

		/** /
		console.log('Available Defaults:', {
			'formComponent': this.formComponent,
			'dataBanner': this.dataBanner,
			'dataContainer': this.dataContainer,
			'dataTemplate': this.dataTemplate
		});
		/**/

		this.pageData$ = combineLatest(
			[
				this.animationService.getAll(),
				this.animationTypeService.getAll(),
				this.easingTypeService.getAll()
			]
		)
		.pipe(
			map(([animations, animationTypes, easingTypes]):any => {
				// combineLatest returns an array of values, here we map those values to an object
				return { animations, animationTypes, easingTypes };
			})
		);

		this.pageData$.pipe(takeUntil(this._destroy$)).subscribe( (data:any) => {
			//console.info('Animation Dialog Component initialise', data);

			this.prepPageData(data);
		});
	}

	private prepPageData(data:any):void {

		this.formDataAnimations = data.animations;
		this.formDataAnimationTypes = data.animationTypes;
		this.formDataEasingTypes = data.easingTypes;

		//this.uiDataReady = true;
		//this.f['projectClient'].enable();

	}

	/**
	 * Prepare Form variables for editing a component
	 *
	 */
	private prepareEditFormValues() {


		this.FormGroupAnimationData = this.formBuilder.group({
			animationId: [this.EditActiveAnimation.id, Validators.required],
			componentId: [this.EditActiveAnimation.componentId, Validators.required],
			animationtypeId: [this.EditActiveAnimation.animationtypeId, Validators.required],
			easingtypeId: [this.EditActiveAnimation.easingtypeId, Validators.required],
			name: [this.EditActiveAnimation.name, Validators.required],
			description: [this.EditActiveAnimation.description, Validators.required],
			timelineorder: [this.EditActiveAnimation.timelineorder, [ Validators.required, Validators.minLength(1) ]],
			animationloop: [this.EditActiveAnimation.animationloop, Validators.required]
		});

		this.FormGroupAnimationMetaData = this.formBuilder.group({
			animationId: [this.EditActiveAnimation.id, Validators.required],
			startTime: [ this.EditActiveAnimation.animationmeta.find((x:any)=>x.name === 'startTime').value,
				[ Validators.required, Validators.minLength(0) ]
			],
			positionX: [ this.EditActiveAnimation.animationmeta.find((x:any)=>x.name === 'positionX').value, Validators.required],
			positionY: [ this.EditActiveAnimation.animationmeta.find((x:any)=>x.name === 'positionY').value, Validators.required],
			opacity: [ this.EditActiveAnimation.animationmeta.find((x:any)=>x.name === 'opacity').value,
				[ Validators.required, Validators.minLength(0), Validators.maxLength(1) ]
			],
			scaleX: [ this.EditActiveAnimation.animationmeta.find((x:any)=>x.name === 'scaleX').value, Validators.nullValidator],
			scaleY: [ this.EditActiveAnimation.animationmeta.find((x:any)=>x.name === 'scaleY').value, Validators.nullValidator],
			rotation: [ this.EditActiveAnimation.animationmeta.find((x:any)=>x.name === 'rotation').value, Validators.nullValidator],
			duration: [	this.EditActiveAnimation.animationmeta.find((x:any)=>x.name === 'duration').value,
				[ Validators.required, Validators.minLength(0), Validators.maxLength(this.dataContainer.duration) ]
			]
		});

		this.listenToAnimationFormInputChanges();

	}

	private updateEditFormValues(posValue:number):void {

		this.changesHaveBeenSaved = false;
		this.FormGroupAnimationMetaData.markAsDirty();

		this.FormGroupAnimationMetaData.patchValue({
			startTime: posValue
		});

	}

	/**
	 * Prepare component meta data for FDCEvent and EditAnimationEvent Events
	 * which pass data to the Page.component and banner.creator.directive for EXISTING Animations.
	 *
	 */
	private setupUpdatedAnimationMetaData() {

		const animationMetaData = {
			startTime: this.FormGroupAnimationMetaData.value['startTime'],
			positionX: this.FormGroupAnimationMetaData.value['positionX'],
			positionY: this.FormGroupAnimationMetaData.value['positionY'],
			opacity: this.FormGroupAnimationMetaData.value['opacity'],
			scaleX: this.FormGroupAnimationMetaData.value['scaleX'],
			scaleY: this.FormGroupAnimationMetaData.value['scaleY'],
			rotation: this.FormGroupAnimationMetaData.value['rotation'],
			duration: this.FormGroupAnimationMetaData.value['duration']
		}

		return animationMetaData;
	}

	private listenToAnimationFormInputChanges() {

		this.fcomponentanimationmeta['duration'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {
			const animationMetaData = this.setupUpdatedAnimationMetaData();
			animationMetaData.duration = value;
			//this.broadcastUpdatedAnimationInputChanges(animationMetaData);
		});

		this.fcomponentanimationmeta['startTime'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {
			const animationMetaData = this.setupUpdatedAnimationMetaData();
			animationMetaData.startTime = value;
			this.broadcastUpdatedAnimationInputChanges(animationMetaData);
		});

		this.fcomponentanimationmeta['positionX'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {

			const animationMetaData = this.setupUpdatedAnimationMetaData();
			animationMetaData.positionX = value;

			//this.broadcastUpdatedAnimationInputChanges(animationMetaData);

			//console.log('positionX:', value, this.EditActiveAnimation, animationMetaData);
		});
		this.fcomponentanimationmeta['positionY'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {
			const animationMetaData = this.setupUpdatedAnimationMetaData();
			animationMetaData.positionY = value;
			//this.broadcastUpdatedAnimationInputChanges(animationMetaData);
		});

		this.fcomponentanimationmeta['opacity'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {
			const animationMetaData = this.setupUpdatedAnimationMetaData();
			animationMetaData.opacity = value;
			//this.broadcastUpdatedAnimationInputChanges(animationMetaData);
		});
		this.fcomponentanimationmeta['scaleX'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {
			const animationMetaData = this.setupUpdatedAnimationMetaData();
			animationMetaData.scaleX = value;
			//this.broadcastUpdatedAnimationInputChanges(animationMetaData);
		});
		this.fcomponentanimationmeta['scaleY'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {
			const animationMetaData = this.setupUpdatedAnimationMetaData();
			animationMetaData.scaleY = value;
			//this.broadcastUpdatedAnimationInputChanges(animationMetaData);
		});
		this.fcomponentanimationmeta['rotation'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {
			const animationMetaData = this.setupUpdatedAnimationMetaData();
			animationMetaData.rotation = value;
			//this.broadcastUpdatedAnimationInputChanges(animationMetaData);
		});

	}

	private broadcastUpdatedAnimationInputChanges( animationMetaData: any ) {

		this.EditAnimationEvent.emit({
			name: this.EditActiveAnimation.name,
			description: this.EditActiveAnimation.description,
			status: true,
			animationId: this.EditActiveAnimation.id,
			animationtypeId: this.EditActiveAnimation.animationtypeId,
			easingtypeId: this.EditActiveAnimation.easingtypeId,
			componentId: this.EditActiveAnimation.componentId,
			animationmeta: animationMetaData

		});
	}

	/** /
	public EditActiveAnimationsEdit( event:any ):void {

		if (!event) return;

		console.log('EditActiveAnimationsEdit', event);

		this.EditActiveAnimation = event;

		this.prepareEditFormValues();

		this.listenToAnimationFormInputChanges();

	}
	/**/

	public closeActiveAnimationEdit():void {
		this.EditAnimationcloseEvent.emit();
	}

	public saveActiveAnimationsEdit(id:string):void {

		if (this.FormGroupAnimationMetaData.invalid) {
			this.alertService.error('Please ensure all the Animation Fields are completed correctly.');
			console.error('Error Saving Animation:', this.FormGroupAnimationMetaData.value);
			return;
		}

		//console.log('saveActiveAnimationsEdit', this.EditActiveAnimation, this.FormGroupEditComponentMeta.value);

		this.EditActiveAnimation.isSaving = true;

		const confirmDialog = this.dialog.open( DialogConfirmComponent, {
			data: {
				title: 'Confirm Update Action',
				message: 'Are you sure you want to update: ' + this.EditActiveAnimation.name + '?.'
			}
		});
		confirmDialog.afterClosed().subscribe(result => {
			if (result === true) {

				this.saveUpdatedAnimationToDB(id);

			} else {
				console.info('Cancel Updating ID:', id);

				this.EditActiveAnimation.isSaving = false;
			}
		});
	}

	private saveUpdatedAnimationToDB(id:string) {

		const newMeta = {
			//animationId: id,
			animationmeta: this.setupUpdatedAnimationMetaData()//this.FormGroupEditComponentMeta.value
		}

		console.info('saveUpdatedAnimationToDB:', id, newMeta);

		//this.EditActiveAnimation.isSaving = false;
		//return;

		this.animationService.updateAnimationMeta( id, newMeta)
			.pipe(first())
			.subscribe({
				next: (updatedAnimation:any) => {

					//console.log('saveUpdatedAnimationToDB complete', this.EditActiveAnimation);

					this.alertService.success(  this.EditActiveAnimation.name + ' updated successfully.', { keepAfterRouteChange: true });

					this.EditActiveAnimation.isSaving = false;

					this.broadcastUpdatedAnimationInputChanges(newMeta.animationmeta);

				},
				error: (error:string) => {
					this.alertService.error(error);
					this.EditActiveAnimation.isSaving = false;
				}
			});
	}

	public deleteActiveAnimationsEdit(id:string):void {

		//console.log('deleteActiveAnimationsEdit', this.EditActiveAnimation, this.FormGroupEditComponentMeta.value);

		this.EditActiveAnimation.isDeleting = true;

		//return;

		const confirmDialog = this.dialog.open( DialogConfirmComponent, {
			data: {
				title: 'Confirm Delete Action',
				message: 'Are you sure you want to delete: ' + this.EditActiveAnimation.name + '?.'
			}
		});
		confirmDialog.afterClosed().subscribe(result => {
			if (result === true) {

				/** /
				this.EditActiveAnimation.isDeleting = false;
				this.alertService.info(  'Testing Component ' + this.EditActiveAnimation.name + ' deletion.', { keepAfterRouteChange: true });
				this.DeleteAnimationEvent.emit(this.EditActiveAnimation);
				this.EditAnimationcloseEvent.emit();
				return;
				/**/

				this.deleteAnimationFromDb(id);

			} else {
				console.info('Cancel Deleting ID:', id);

				this.EditActiveAnimation.isDeleting = false;
			}
		});
	}

	private deleteAnimationFromDb(id:string) {

		this.EditActiveAnimation.isDeleting = false;

		console.info('deleteActiveAnimationsEdit:', this.EditActiveAnimation);

		//return;

		this.animationService.delete( id )
			.pipe(first())
			.subscribe({
				next: (deletedAnimation:any) => {
					this.EditActiveAnimation.isDeleting = false;
					this.alertService.success( this.EditActiveAnimation.name + ' deleted successfully.', { keepAfterRouteChange: false });
					this.DeleteAnimationEvent.emit(this.EditActiveAnimation);
					this.EditAnimationcloseEvent.emit();
				},
				error: error => {
					console.error('Error Deleting Animation:', error);
					this.EditActiveAnimation.isDeleting = false;
					this.alertService.error(error);

				}
			});

	}

	public toggleStatus(event:any, id: string):void {
		this.updateStatus(id, {
			status: event.checked
		});
	}

	private updateStatus( id: string, params: any ):void {

		this.animationService.updateStatus(id, params)
			.pipe(first())
			.subscribe({
				next: () => {
					this.alertService.success('Animation Status changed successfully', { keepAfterRouteChange: true });
				},
				error: error => {
					this.alertService.error(error);
				}
			});
	}

	public ListtrackByFn(index:number, item:any) {
		return item.id; // or item.id
	}
}
