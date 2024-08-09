import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Account, Animation, Role } from '@app/core/models';
import { AccountService, AlertService, AnimationService, AnimationTypeService, EasingTypeService } from '@app/core/services';
import * as introJs from 'intro.js';
import { combineLatest, Observable, Subject } from 'rxjs';
import { first, map, takeUntil } from 'rxjs/operators';

@Component({
	templateUrl: './add.edit.page.html',
	styleUrls: ['./add.edit.page.scss'],
})
export class AnimationsAddEditPage implements OnInit, OnDestroy {

	// will use the _destroy$ observable to control
	// fetching items from an observable
	private _destroy$ = new Subject<boolean>();

	//user onboarding
	private introJS = introJs();

	public pageData$!: Observable<any>;
	public formDataAnimationTypes: any = [];
	public formDataEasingTypes: any = [];
	public formDataAnimations: any = [];

	form!: FormGroup;
	id!: string;
	isAddMode!: boolean;
	loading = false;
	submitted = false;

	Role = Role;
	animation!: Animation;
	account!: Account;

	constructor(
		private formBuilder: FormBuilder,
		private route: ActivatedRoute,
		private router: Router,
		private dialog: MatDialog,
		private location: Location,
		private accountService: AccountService,
		private animationService: AnimationService,
		private easingTypeService: EasingTypeService,
		private animationTypeService: AnimationTypeService,
		private alertService: AlertService
	) {

		this.account = this.accountService.accountValue;
		this.onboarding();
	}

	// convenience getter for easy access to form fields
	get f() { return this.form.controls; }

	ngOnInit() {
		this.id = this.route.snapshot.params['id'];
		this.isAddMode = !this.id;

		this.form = this.formBuilder.group({
			componentId: ['', Validators.required],
			animationtypeId: ['', Validators.required],
			easingtypeId: ['', Validators.required],
			timelineorder: ['', [Validators.required, Validators.minLength(1)]],
			animationloop: ['', Validators.required],
			name: ['', Validators.required],
			status: ['', Validators.required],
			description: ['', Validators.required]
		});

		this.initialise();

		if (!this.isAddMode) {
			this.animationService.getById(this.id)
				.pipe(first())
				.subscribe((x) => {
					this.form.patchValue(x);
				});

			const animationNameExists = this.formDataAnimations.find((animation: any) => animation.name === (this.f['name'] + '_animation'));

			////console.log('animationNameExists', animationNameExists, this.formComponent.animations);

			if (animationNameExists) {

				//this.alertService.error('This component name already exists. Please select "Custom" and specify a unique name.');

				this.f['name'].patchValue(this.f['name'] + '_animation_' + this.getRandomArbitrary(99, 99999).toFixed(0));

			} else {

				this.f['name'].patchValue(this.f['name']);

			}
		}
	}

	ngOnDestroy(): void {
		console.warn('Add Animation Page ngOnDestroy');
		this._destroy$.next(false);
		this._destroy$.complete();
	}

	onSubmit() {
		this.submitted = true;

		// reset alerts on submit
		this.alertService.clear();

		// stop here if form is invalid
		if (this.form.invalid) {
			this.alertService.error('Please ensure all the Animation Fields are completed correctly.');
			console.error('Error Saving Animation:', this.form.value);
			return;
		}

		this.loading = true;
		if (this.isAddMode) {
			this.createRecord();
		} else {
			this.updateRecord();
		}
	}

	private initialise(): void {

		/** /
		//console.log('Available Defaults:', {
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
				map(([animations, animationTypes, easingTypes]): any => {
					// combineLatest returns an array of values, here we map those values to an object
					return { animations, animationTypes, easingTypes };
				})
			);

		this.pageData$.pipe(takeUntil(this._destroy$)).subscribe((data: any) => {
			//console.info('Animation Dialog Component initialise', data);

			this.prepPageData(data);
		});
	}

	private prepPageData(data: any): void {

		this.formDataAnimations = data.animations;
		this.formDataAnimationTypes = data.animationTypes;
		this.formDataEasingTypes = data.easingTypes;

		//this.uiDataReady = true;
		//this.f['projectClient'].enable();

	}

	private getRandomArbitrary(min: number, max: number) {
		return Math.random() * (max - min) + min;
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

		this.alertService.info('Help/Onboarding Feature still in WIP.', { keepAfterRouteChange: true });
	}

	private createRecord() {
		this.animationService.create(this.form.value)
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
		this.animationService.update(this.id, this.form.value)
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

	public ListtrackByFn(index: number, item: any) {
		return index; // or item.id
	}

}
