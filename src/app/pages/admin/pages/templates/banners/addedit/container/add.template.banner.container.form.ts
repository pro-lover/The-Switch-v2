import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, ComponentService, ContainerService } from '@app/core/services';
import { forkJoin, Subject } from 'rxjs';
import { first, last } from 'rxjs/operators';

@Component({
	selector: 'app-container-add',
	templateUrl: './add.template.banner.container.form.html',
	styleUrls: ['./add.template.banner.container.form.scss'],
	providers: [
		{
			provide: STEPPER_GLOBAL_OPTIONS,
			useValue: { showError: true },
		},
	],
})
export class TemplatesAddContainerFormDialogComponent implements OnInit, OnDestroy {

	// will use the _destroy$ observable to control
	// fetching items from an observable
	private _destroy$ = new Subject<boolean>();

	isAddMode!: boolean;
	loading = false;
	submitted = false;

	@Input() formContainer!: any;
	@Input() dataBannerContainerId!: number | string;
	@Input() dataTemplate!: any;
	@Input() dataBanner!: any;


	@Output() FDCEvent = new EventEmitter<any>();

	public FormGroupContainerData!: FormGroup;

	constructor(
		private formBuilder: FormBuilder,
		private alertService: AlertService,
		private containerService: ContainerService,
		private componentService: ComponentService
	) {


	}

	// convenience getter for easy access to form fields
	get ftemplatecontainer() { return this.FormGroupContainerData.controls; }

	ngOnInit() {

		this.isAddMode = true;

		this.prepareForm();

	}

	ngOnDestroy(): void {
		console.warn('Template Banner Add Container Dialog ngOnDestroy');
		this._destroy$.next(false);
		this._destroy$.complete();
		//this._destroy$.unsubscribe();
		//this.ViewCollection.unsubscribe();
	}

	/**
	 * Prepare Form variables for a new component
	 *
	 * formDataComponentType is the empty component type from the database. Hence using 'name'
	 * to initialise the form controls for each respective component type.
	 *
	 */
	private prepareForm() {

		////console.log('dataBanner:', this.dataBanner);
		const sampleContainerName = this.dataBanner.bannersize.name + ' Frame ' + (this.dataBanner.containers.length + 1);

		this.FormGroupContainerData = this.formBuilder.group({
			bannerId: [this.dataBanner.id, Validators.required],
			name: [sampleContainerName, Validators.required],
			description: ['', Validators.required],
			components: ['', Validators.required]
		});
	}

	private resetForm() {

		this.prepareForm();
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
	private broadcastNewContainer(newContainer: any) {

		//console.log('Broadcast New Container:', newContainer);

		this.FDCEvent.emit(newContainer);
	}

	/**
	 * Linked to Button onClick
	 *
	 */
	public addContainer() {

		this.loading = true;

		// stop here if form is invalid
		if (this.FormGroupContainerData.invalid) {
			console.error('Adding Container:', this.FormGroupContainerData.value, this.FormGroupContainerData.invalid);

			this.alertService.error('Please ensure you\'ve completed all the form fields.');

			this.loading = false;
			return;
		}

		this.saveContainer();

		this.loading = false;

		this.resetForm();

	}

	/**
	 * Save a newly added component to the database.
	 *
	 */
	private saveContainer() {

		// stop here if form is invalid
		if (this.FormGroupContainerData.invalid) {
			this.alertService.error('Please ensure all the Container Fields are completed correctly.');
			console.error('Saving Container:', this.FormGroupContainerData.value, this.FormGroupContainerData.invalid);
			return;
		}

		const componentsToSave: any = [];

		this.formContainer.components.forEach((x: any) => {
			const elem = x.id.toString();
			if (this.FormGroupContainerData.value.components.indexOf(elem) !== -1) {
				componentsToSave.push(x);
			}
		});

		//this.loading = true;
		//this.alertService.info( 'Container Saving Test.', { keepAfterRouteChange: false });
		////console.log('Saving Container:', this.FormGroupContainerData.value, componentsToSave);

		//return;

		this.containerService.create(this.FormGroupContainerData.value)
			.pipe(first())
			.subscribe({
				next: (newContainerDb: any) => {

					if (componentsToSave.length > 0) {

						const componentsCreatePromises = [];
						for (let index = 0; index < componentsToSave.length; index++) {

							const elementComp = componentsToSave[index];

							const metaData: any = {};

							elementComp.componentmeta.forEach((x: any) => {
								metaData[x.name] = x.value;
							});

							componentsCreatePromises.push(
								this.componentService.create({
									name: elementComp.name,
									description: 'N/A',
									smart: false,
									status: true,
									componenttypeId: elementComp.componenttypeId,
									containerId: newContainerDb.id,
									componentmeta: metaData
								})
							);
						}

						forkJoin(componentsCreatePromises)
							.pipe(last())
							.subscribe({
								next: (componentsResults: any[]) => {

									this.alertService.success('Container Saved and Components Duplicated Successfully', { keepAfterRouteChange: true });

									this.loading = false;

									newContainerDb.components = componentsResults;

									this.broadcastNewContainer(newContainerDb);

								},
								error: error => {
									this.alertService.error(error);
									this.loading = false;
								}
							});

					} else {
						this.loading = false;
						this.alertService.success('Container Saved successfully.', { keepAfterRouteChange: false });
						this.broadcastNewContainer(newContainerDb);
					}

				},
				error: error => {
					this.loading = false;
					this.alertService.error(error);

				}
			});
	}

}
