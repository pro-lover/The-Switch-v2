import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BannerSize, BannerType, Template } from '@app/core/models';
import { AlertService, BannerService, BannerSizeService, BannerTypeService, TemplateService } from '@app/core/services';
import { Subject } from 'rxjs';
import { first, takeUntil } from 'rxjs/operators';

@Component({
	templateUrl: './dialog.form.duplicate.banner.component.html',
	styleUrls: ['./dialog.form.edit.banner.component.scss'],
})
export class DialogBannerDuplicateComponent implements OnInit, OnDestroy {

	// will use the _destroy$ observable to control
	// fetching items from an observable
	private _destroy$ = new Subject<boolean>();

	form!: FormGroup;
	loading = false;
	submitted = false;

	public updatedModelData: any;

	public formDataTemplates!: Template[];
	public formDataBannerTypes!: BannerType[];
	public formDataBannerSizes!: BannerSize[];

	constructor(
		private formBuilder: FormBuilder,
		private bannerService: BannerService,
		private templateService: TemplateService,
		private bannerSizeService: BannerSizeService,
		private bannerTypeService: BannerTypeService,
		private alertService: AlertService,
		public dialogRef: MatDialogRef<DialogBannerDuplicateComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {

		console.log('DialogBannerDuplicateComponent:', this.data);

		this.bannerSizeService.getAll()
			.pipe(first())
			.subscribe( (x: BannerSize[]) => {
				this.formDataBannerSizes = x;
			});

		this.bannerTypeService.getAll()
			.pipe(first())
			.pipe(takeUntil(this._destroy$))
			.subscribe( (x: BannerType[]) => {
				this.formDataBannerTypes = x;
			});

		this.templateService.getAll()
			.pipe(first())
			.pipe(takeUntil(this._destroy$))
			.subscribe( (x: Template[]) => {
				this.formDataTemplates = x;
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
}
