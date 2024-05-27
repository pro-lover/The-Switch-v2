import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, ComponentService, ContainerService } from '@app/core/services';
import { forkJoin, Subject } from 'rxjs';
import { first, last } from 'rxjs/operators';

@Component({
	selector: 'app-container-edit',
	templateUrl: './edit.template.banner.container.form.html',
	styleUrls: ['./edit.template.banner.container.form.scss'],
	providers: [
		{
			provide: STEPPER_GLOBAL_OPTIONS,
			useValue: {showError: true},
		},
	],
})
export class TemplatesEditContainerFormDialogComponent implements OnInit, OnDestroy {

	// will use the _destroy$ observable to control
	// fetching items from an observable
	private _destroy$ = new Subject<boolean>();

	isAddMode!: boolean;
	loading = false;
	submitted = false;

	@Input() formContainer!: any;
	@Input() dataTemplate!: any;
	@Input() dataBanner!: any;


	@Output() FDCEvent = new EventEmitter<any>();

	public FormGroupContainerData!: FormGroup;

	constructor(
		private formBuilder: FormBuilder,
		private alertService: AlertService,
		private componentService: ComponentService,
		private containerService: ContainerService
	) {}

	// convenience getter for easy access to form fields
	get ftemplatecontainer() { return this.FormGroupContainerData.controls; }

	ngOnInit() {

		this.isAddMode = true;

		this.prepareForm();

	}

	ngOnDestroy(): void {
		console.warn('Template Banner Edit Container Dialog ngOnDestroy');
		this._destroy$.next(false);
		this._destroy$.complete();
	}

	/**
	 * Prepare Form variables for container
	 *
	 */
	private prepareForm() {
		// https://www.regextester.com/94502
		const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;

		this.FormGroupContainerData = this.formBuilder.group({
			bannerId: [this.dataBanner.id, Validators.required],
			name: [this.formContainer.name, Validators.required],
			description: [this.formContainer.description, Validators.required],
			displayorder: [this.formContainer.displayorder, Validators.required],
			duration: [this.formContainer.duration, Validators.required],
			clickThroughName: [this.formContainer.clickThroughName, Validators.required],
			clickThroughURL: [this.formContainer.clickThroughURL, [
				//Validators.nullValidator,
				Validators.required,
				Validators.pattern(urlRegex)
				//Validators.pattern('(https?:\/\/)([\\da-z.-]*)(.*)(\.css)')
			]]
		});
	}

	private resetForm() {

		this.prepareForm();
	}

	/**
	 * Triggered by successfull updateContainer()
	 *
	 * Triggers FDCEvent which is bound to
	 * passContainerFromDialog() method in dialog.container.edit.ts component which
	 * passes the updated container to the promise initialised in add.edit.banner.page.ts
	 *
	 */
	private broadcastUpdatedContainer( updatedContainer: any ) {

		console.log('Broadcast Updated Container:', updatedContainer);

		this.FDCEvent.emit(updatedContainer);
	}

	/**
	 * Linked to Button onClick
	 *
	 * Triggers Save Method
	 */
	public updateContainer() {

		this.loading = true;

		// stop here if form is invalid
		if (this.FormGroupContainerData.invalid) {
			console.error('Adding Container:', this.FormGroupContainerData.value, this.FormGroupContainerData.invalid);

			this.alertService.error('Please ensure you\'ve completed all the form fields.');

			this.loading = false;
			return;
		}

		this.saveContainerUpdates();

		this.resetForm();

	}

	/**
	 * Save a updated container to the database.
	 *
	 */
	private saveContainerUpdates() {

		// stop here if form is invalid
		if (this.FormGroupContainerData.invalid) {
			this.alertService.error('Please ensure all the Container Fields are completed correctly.');
			console.error('updating Container:', this.FormGroupContainerData.value, this.FormGroupContainerData.invalid);
			this.loading = false;
			return;

		} else if ( [null, undefined, ''].includes(this.formContainer.id) ) {

			this.alertService.error('Container ID is missing. Please contact the Admin about this error.');

			this.loading = false;
			return;
		}

		this.containerService.update( this.formContainer.id, this.FormGroupContainerData.value )
			.pipe(first())
			.subscribe({
				next: (updatedContainer:any) => {

					this.alertService.success('Container updated Successfully.', { keepAfterRouteChange: true });

					this.loading = false;

					this.broadcastUpdatedContainer( updatedContainer );

				},
				error: error => {
					this.loading = false;
					this.alertService.error(error);

				}
			});
	}

	private deleteContainer() {

		this.containerService.delete( this.formContainer.id )
			.pipe(first())
			.subscribe({
				next: () => {

					if( this.formContainer.components.length > 0 ) {

						const noofcontainerstodelete = this.formContainer.components.length;

						const componentsDeletePromises = [];
						for (let index = 0; index < noofcontainerstodelete; index++) {

							const containerComp = this.formContainer.components[index];

							componentsDeletePromises.push(
								this.componentService.delete( containerComp.id )
							);
						}

						forkJoin(componentsDeletePromises)
							.pipe(last())
							.subscribe({
								next: () => {

									this.alertService.success('Container deleted and components removed successfully', { keepAfterRouteChange: true });
									this.loading = false;

									//newContainerDb.components = componentsResults;
									//this.broadcastNewContainer( newContainerDb );

								},
								error: error => {
									this.alertService.error(error);
									this.loading = false;
								}
							});

							/** /
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

							this.broadcastUpdatedContainer( updatedContainer );
							/**/

					} else {
						this.alertService.success('Container deleted Successfully.', { keepAfterRouteChange: true });
					}

				},
				error: error => {
					this.loading = false;
					this.alertService.error(error);

				}
			});

	}

}
