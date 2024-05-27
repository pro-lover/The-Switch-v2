
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DialogConfirmComponent } from '@app/components';
import { Template } from '@app/core/models';
import { AlertService, ComponentService } from '@app/core/services';
import { last, Subject, takeUntil } from 'rxjs';

@Component({
	selector: 'app-component-duplicate',
	templateUrl: './duplicate.template.banner.component.dialog.html',
	styleUrls: ['./duplicate.template.banner.component.dialog.scss'],
})
export class TemplateBannerDuplicateDialogComponent implements OnInit, OnDestroy {

	// will use the _destroy$ observable to control
	// fetching items from an observable
	private _destroy$ = new Subject<boolean>();

	//public id!: string;
	//public isAddMode!: boolean;
	public loading = false;
	public submitted = false;

	public formContainers!:any[];
	public formComponentMeta:any;

	//
	@Input() dataBanner!: any;
	@Input() dataComponent!: any;
	@Input() dataTemplate!: Template;
	@Input() dataContainerId!: string;

	// Drag and Drop
	@Output() FDCEvent = new EventEmitter<any>();

	// component meta data form
	public FormGroupComponentDuplicate!: FormGroup;

	constructor(
		private dialog: MatDialog,
		private formBuilder: FormBuilder,
		private alertService: AlertService,
		private componentService: ComponentService
	) {}

	// convenience getter for easy access to form fields for editing components data
	get ftemplatecomponent() { return this.FormGroupComponentDuplicate.controls; }

	ngOnInit() {

		//this.isAddMode = false;
		this.initialise();

	}

	ngOnDestroy(): void {
		console.warn('Template Banner Component Duplicate Dialog ngOnDestroy');
		this._destroy$.next(false);
		this._destroy$.complete();
	}

	public initialise():void {

		//console.log('dataBanner', this.dataBanner);
		//console.log('dataComponent', this.dataComponent);
		//console.log('sampleComponentName', this.dataComponent.componenttype.name.toLowerCase() );

		this.formContainers = this.dataBanner.containers;
		this.formComponentMeta = this.dataComponent.componentmeta.reduce((r:any,{name,value}:any) => (r[name]=value,r), {});

		//console.log('formComponentMeta', this.formComponentMeta );
		//this.dataComponent = event;

		this.prepareForm();

	}

	private resetForm() {

		this.prepareForm();
	}


	/**
	 * Prepare Form variables for editing a component
	 *
	 */
	private prepareForm() {

		const sampleComponentName = this.dataComponent.componenttype.name.toLowerCase() + '_' + this.getRandomArbitrary(99, 99999).toFixed(0);

		this.FormGroupComponentDuplicate = this.formBuilder.group({
			name: [sampleComponentName, Validators.required],
			description: ['N/A', Validators.required],
			smart: [ this.dataComponent.smart, Validators.required],
			status: [ true, Validators.required],
			componenttypeId: [ this.dataComponent.componenttypeId, Validators.required],
			containerId: [ '', Validators.required],
			componentmeta: [ this.formComponentMeta, Validators.required],
		});

		this.ftemplatecomponent['containerId'].valueChanges.pipe(takeUntil(this._destroy$)).subscribe((value) => {
			console.log('Updated Selected Container ID:', value);
		});

	}

	private noSpecialCharactersandSpace ( str:string ):string {

		return str.replace(/[^\w]/gi, '_');
		//return str.replace(/[^A-Z0-9]+/ig, "_");

	}

	private getRandomArbitrary(min:number, max:number) {
		return Math.random() * (max - min) + min;
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
	private broadcastNewComponent( newComponent: any ) {

		console.log('Broadcast Duplicated Component:', newComponent);

		this.FDCEvent.emit(newComponent);
	}

	/**
	 * Linked to Button onClick
	 *
	 */
	public duplicateComponent() {

		this.loading = true;

		// stop here if form is invalid
		if (this.FormGroupComponentDuplicate.invalid) {
			console.error('Duplicating Component:', this.FormGroupComponentDuplicate.value, this.FormGroupComponentDuplicate.invalid);

			this.alertService.error('Please ensure you\'ve completed all the form fields.');

			this.loading = false;
			return;
		}

		const confirmDialog = this.dialog.open( DialogConfirmComponent, {
			data: {
				title: 'Confirm duplicate action?',
				message: 'Are you sure you want to duplicate this component: ' + this.dataComponent.name + '?.'
			}
		});
		confirmDialog.afterClosed().subscribe(result => {
			if (result === true) {

				this.saveComponent();

			} else {
				console.info('Cancel Updating ID:');

				this.loading = false;
			}
		});

	}

	/**
	 * Save a newly added component to the database.
	 *
	 */
	private saveComponent() {

		// stop here if form is invalid
		if (this.FormGroupComponentDuplicate.invalid) {
			this.alertService.error('Please ensure all the Container Fields are completed correctly.');
			console.error('Saving Container:', this.FormGroupComponentDuplicate.value, this.FormGroupComponentDuplicate.invalid);
			return;
		}

		console.log('Saving Component:', this.FormGroupComponentDuplicate.value);

		//return;

		this.componentService.create(this.FormGroupComponentDuplicate.value)
		.pipe(last())
		.subscribe({
			next: ( duplicatedComponent:any ) => {

				this.alertService.success('Component Duplicated Successfully', { keepAfterRouteChange: true });

				this.loading = false;

				this.broadcastNewComponent( duplicatedComponent );

			},
			error: error => {
				this.alertService.error(error);
				this.loading = false;
			}
		});

	}
}
