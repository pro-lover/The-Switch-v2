import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, AnimationService, AnimationTypeService, ComponentService, EasingTypeService } from '@app/core/services';
import { combineLatest, Observable, Subject } from 'rxjs';
import { first, map, takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-animation-add',
	templateUrl: './add.template.banner.component.animation.form.html',
	styleUrls: ['./add.template.banner.component.animation.form.scss'],
	providers: [
		{
			provide: STEPPER_GLOBAL_OPTIONS,
			useValue: {
				showError: true,
				displayDefaultIndicatorType: false
			}
		},
	],
})
export class TemplatesAddAnimationFormDialogComponent implements OnInit, OnDestroy {

	// will use the _destroy$ observable to control
	// fetching items from an observable
	private _destroy$ = new Subject<boolean>();

	isAddMode!: boolean;
	loading = false;
	submitted = false;

	public pageData$!:Observable<any>;

	public formDataAnimations:any = [];
	public formDataAnimationTypes:any = [];
	public formDataEasingTypes:any = [];

	public FormGroupAnimationData!: FormGroup;
	public FormGroupAnimationMetaData!: FormGroup;
	public FormGroupAnimationMetaDataEntry!: FormGroup;
	public FormGroupAnimationMetaDataExit!: FormGroup;

	//
	@Input() formComponent!: any;
	@Input() dataBannerContainerId!: number | string;
	@Input() dataTemplate!: any;
	@Input() dataBanner!: any;
	//@Input() dataComponent!: any;
	@Input() dataContainer!: any;


	@Output() AddAnimationEvent = new EventEmitter<any>();

	constructor(
		private formBuilder: FormBuilder,
		private alertService: AlertService,
		private animationService: AnimationService,
		private easingTypeService: EasingTypeService,
		private animationTypeService: AnimationTypeService,
		private componentService: ComponentService
	) {


	}

	// convenience getter for easy access to form fields
	get fcomponentanimation() { return this.FormGroupAnimationData.controls; }
	get fcomponentanimationmeta() { return this.FormGroupAnimationMetaData.controls; }
	get fcomponentanimationmeta_entry() { return this.FormGroupAnimationMetaDataEntry.controls; }
	get fcomponentanimationmeta_exit() { return this.FormGroupAnimationMetaDataExit.controls; }

	ngOnInit() {

		this.isAddMode = true;

		this.prepareForm();

		this.initialise();

	}

	ngOnDestroy(): void {
		console.warn('Component Add Animation Dialog ngOnDestroy');
		this._destroy$.next(false);
		this._destroy$.complete();
	}

	private initialise():void {

		/**/
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
	 * Prepare Form variables for a new animation
	 *
	 * formDataComponentType is the empty animation type from the database. Hence using 'name'
	 * to initialise the form controls for each respective animation type.
	 *
	 */
	private prepareForm() {

		this.FormGroupAnimationData = this.formBuilder.group({
			componentId: [this.formComponent.id, Validators.required],
			animationtypeId: ['', Validators.required],
			easingtypeId: [2, Validators.required],
			timelineorder: [
				(this.formComponent.animations.length + 1),
				[
					Validators.required,
					 Validators.minLength(1)
				]
			],
			animationloop: [false, Validators.required],
			name: [this.formComponent.name + '_animation', Validators.required],
			description: [this.dataContainer.name, Validators.required]
		});

		this.FormGroupAnimationMetaData = this.formBuilder.group({
			//animationId: ['', Validators.required],
			startTime: [ '',
				[ Validators.required, Validators.minLength(0) ]
			],
			positionX: [ this.formComponent.componentmeta.positionX, Validators.required],
			positionY: [ this.formComponent.componentmeta.positionY, Validators.required],
			opacity: [ '',
				[ Validators.required, Validators.minLength(0), Validators.maxLength(1) ]
			],
			scaleX: [ '', Validators.nullValidator],
			scaleY: [ '', Validators.nullValidator],
			rotation: [ '', Validators.nullValidator],
			duration: [	'',
				[ Validators.required, Validators.minLength(0), Validators.maxLength(this.dataContainer.duration) ]
			]
		});

		this.FormGroupAnimationMetaDataExit = this.formBuilder.group({
			animationId: ['', Validators.required],
			positionX: [ this.formComponent.componentmeta.positionX, Validators.required],
			positionY: [ this.formComponent.componentmeta.positionY, Validators.required],
			opacity: [ 1,
				[ Validators.required, Validators.minLength(0), Validators.maxLength(1) ]
			],
			scaleX: [ '', Validators.nullValidator],
			scaleY: [ '', Validators.nullValidator],
			rotation: [ '', Validators.nullValidator],
			duration: [	0.5,
				[ Validators.required, Validators.minLength(0), Validators.maxLength(this.dataContainer.duration) ]
			]
		});

		const animationNameExists = this.formComponent.animations.find( (animation:any) => animation.name === (this.formComponent.name) );

		////console.log('animationNameExists', animationNameExists, this.formComponent.animations);

		if( animationNameExists ) {

			//this.alertService.error('This component name already exists. Please select "Custom" and specify a unique name.');

			this.fcomponentanimation['name'].patchValue(this.formComponent.name + '_animation_' + this.getRandomArbitrary(99, 99999).toFixed(0));

		} else {

			this.fcomponentanimation['name'].patchValue(this.formComponent.name);

		}

		if( this.formComponent.animations.length === 0 ) {
			this.fcomponentanimation['animationtypeId'].patchValue(3);
			this.fcomponentanimationmeta['startTime'].patchValue(0);
			this.fcomponentanimationmeta['duration'].patchValue(0);
		}
	}

	private getRandomArbitrary(min:number, max:number) {
		return Math.random() * (max - min) + min;
	}

	private resetForm() {

		this.prepareForm();
	}

	/**
	 * Linked to Button onClick
	 *
	 * Triggers AddAnimationEvent which is bound to
	 * addComponent() method in add.edit.template.banner.page.ts component which
	 * pushes the new component as the latest value of newComponentSubject Observable (newComponentObs).
	 * newComponentObs is subscribed to banner.creator.directive.ts
	 *
	 */
	private broadcastNewAnimation( newAnimation: any ) {

		//console.log('Broadcast New Animation:', newAnimation);

		this.AddAnimationEvent.emit(newAnimation);
	}

	/**
	 * Linked to Button onClick
	 *
	 */
	public addAnimation() {

		this.loading = true;

		// stop here if form is invalid
		if (this.FormGroupAnimationData.invalid) {
			console.error('Adding Animation:', this.FormGroupAnimationData.value, this.FormGroupAnimationData.invalid);

			this.alertService.error('Please ensure you\'ve completed all the Animation Selection fields.');

			this.loading = false;
			return;
		}

		if (this.FormGroupAnimationMetaData.invalid) {
			console.error('Adding Animation:', this.FormGroupAnimationMetaData.value, this.FormGroupAnimationMetaData.invalid);

			this.alertService.error('Please ensure you\'ve completed all the Animation Keyframe fields.');

			this.loading = false;
			return;
		}

		this.saveAnimation();

	}

	/**
	 * Save a newly added component to the database.
	 *
	 */
	private saveAnimation() {

		const animationData = this.FormGroupAnimationData.value;
		animationData.animationmeta = this.FormGroupAnimationMetaData.value;
		//this.loading = true;
		//this.alertService.info( 'Container Saving Test.', { keepAfterRouteChange: false });
		//console.log('Saving Animation:', animationData);

		//return;

		this.animationService.create( animationData )
			.pipe(first())
			.subscribe({
				next: (newAnimation:any) => {

					//console.log('New Animation:', newAnimation);

					this.loading = false;
					this.alertService.success( 'Animation Saved successfully.', { keepAfterRouteChange: false });
					this.broadcastNewAnimation( newAnimation );

					this.resetForm();

				},
				error: error => {
					this.loading = false;
					this.alertService.error(error);

				}
			});
	}

	public ListtrackByFn(index:number, item:any) {
		return item.id; // or item.id
	}

}
