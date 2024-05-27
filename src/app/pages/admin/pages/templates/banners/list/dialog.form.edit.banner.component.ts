import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogRestoreComponent } from '@app/components';
import { BannerType } from '@app/core/models';
import { AlertService, BannerService, BannerTypeService, ComponentService, ContainerService } from '@app/core/services';
import { forkJoin, Subject } from 'rxjs';
import { first, last, takeUntil } from 'rxjs/operators';

@Component({
	templateUrl: './dialog.form.edit.banner.component.html',
	styleUrls: ['./dialog.form.edit.banner.component.scss'],
})
export class DialogBannerEditComponent implements OnInit, OnDestroy {

	// will use the _destroy$ observable to control
	// fetching items from an observable
	private _destroy$ = new Subject<boolean>();

	form!: FormGroup;
	loading = false;
	submitted = false;

	public updatedModelData: any;

	public formDataBannerTypes!: BannerType[];

	constructor(
		private dialog: MatDialog,
		private formBuilder: FormBuilder,
		private bannerService: BannerService,
		private bannerTypeService: BannerTypeService,
		private alertService: AlertService,
		private componentService: ComponentService,
		private containerService: ContainerService,
		public dialogRef: MatDialogRef<DialogBannerEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {

		console.log('DialogBannerEditComponent:', this.data);

		this.bannerTypeService.getAll()
			.pipe(first())
			.pipe(takeUntil(this._destroy$))
			.subscribe( (x: BannerType[]) => {
				this.formDataBannerTypes = x;
			});

	}

	// convenience getter for easy access to form fields
	get f() { return this.form.controls; }

	ngOnInit() {

		this.form = this.formBuilder.group({
			name: ['', Validators.required],
			description: ['', Validators.required],
			bannertypeId: ['', Validators.required],
			bannersizeId: ['', Validators.required],
			templateId: ['', Validators.required]
		});

		this.form.patchValue(this.data.data);

		this.updatedModelData = this.form.value;
	}

	ngOnDestroy() {
		this._destroy$.next(false);
		this._destroy$.complete();
	}

	public onSubmit(): void {
		this.submitted = true;

		// reset alerts on submit
		this.alertService.clear();

		// stop here if form is invalid
		if (this.form.invalid) {
			console.error('this.form.value', this.form.value);
			this.alertService.error('Please complete all the required fields correctly.');
			return;
		}

		this.loading = true;
		//this.updateRecord();

		this.updatedModelData = this.form.value;

		this.dialogRef.close(this.updatedModelData);
	}

	public deleteContainer( id:string) {

		const deletedContainer = this.data.data.containers.find((x:any) => x.id === id);

		deletedContainer.isDeleting = true;

		console.warn('deletedContainer:', deletedContainer);

		const confirmDialog = this.dialog.open( DialogRestoreComponent, {
			data: {
				title: 'Confirm delete',
				message: 'Are you sure you want to delete this container: ' + deletedContainer.name
			}
		});

		confirmDialog.afterClosed().subscribe(result => {
			if (result === true) {

				console.warn('deletedContainer:', deletedContainer);

				//return;
				/**/
				this.containerService.delete( deletedContainer.id )
				.pipe(first())
				.subscribe({
					next: () => {

						if( deletedContainer.components.length > 0 ) {

							const noofcontainerstodelete = deletedContainer.components.length;

							const componentsDeletePromises = [];
							for (let index = 0; index < noofcontainerstodelete; index++) {

								const containerComp = deletedContainer.components[index];

								componentsDeletePromises.push(
									this.componentService.delete( containerComp.id )
								);
							}

							forkJoin(componentsDeletePromises)
								.pipe(last())
								.subscribe({
									next: () => {

										this.alertService.success('Container deleted and components removed successfully', { keepAfterRouteChange: true });
										deletedContainer.isDeleting = false;

										this.data.data.containers = this.data.data.containers.filter((x:any) => x.id !== deletedContainer.id);

										//newContainerDb.components = componentsResults;
										//this.broadcastNewContainer( newContainerDb );

									},
									error: error => {
										this.alertService.error(error);
										deletedContainer.isDeleting = false;
									}
								});

						} else {

							this.data.data.containers = this.data.data.containers.filter((x:any) => x.id !== deletedContainer.id);

							deletedContainer.isDeleting = false;
							this.alertService.success('Container deleted Successfully.', { keepAfterRouteChange: true });
						}

					},
					error: error => {
						deletedContainer.isDeleting = false;
						this.alertService.error(error);

					}
				});
				/**/
			} else {
				//console.info('Cancel Restoring record ID:', id);

				deletedContainer.isDeleting = false;
			}
		});

	}

	public restoreContainer(id: string): void {
		const model = this.data.data.containers.find((x:any) => x.id === id);
		model.isDeleting = true;

		const confirmDialog = this.dialog.open( DialogRestoreComponent, {
			data: {
				title: 'Confirm Restoration',
				message: 'Are you sure you want to restore this record: ' + model.name
			}
		});
		confirmDialog.afterClosed().subscribe(result => {
			if (result === true) {

				/**/
				this.containerService.restore(id)
					.pipe(first())
					.subscribe({
						next: () => {
							this.alertService.success(  model.name + ' Restored successfully.', { keepAfterRouteChange: true });
							model.isDeleting = false;
						},
						error: (error:string) => {
							this.alertService.error(error);
							model.isDeleting = false;
						}
					});
				/**/
			} else {
				//console.info('Cancel Restoring record ID:', id);

				model.isDeleting = false;
			}
		});
	}
}
