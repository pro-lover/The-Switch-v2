import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Account, BannerSize, Role } from '@app/core/models';
import { AccountService, AlertService, BannerSizeService } from '@app/core/services';
import * as introJs from 'intro.js';
import { first } from 'rxjs/operators';

@Component({
	templateUrl: './add.edit.page.html',
	styleUrls: ['./add.edit.page.scss'],
})
export class BannerSizesAddEditPage implements OnInit {

	form!: FormGroup;
	id!: string;
	isAddMode!: boolean;
	loading = false;
	submitted = false;

	Role = Role;
	bannerSize!: BannerSize;
	account!: Account;

	//user onboarding
	private introJS = introJs();

	constructor(
		private formBuilder: FormBuilder,
		private route: ActivatedRoute,
		private router: Router,
		private dialog: MatDialog,
		private location: Location,
		private accountService: AccountService,
		private bannerSizeService: BannerSizeService,
		private alertService: AlertService,
		private _snackBar: MatSnackBar
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
			name: ['', Validators.required],
			description: ['', Validators.required],
			width: ['', Validators.required],
			height: ['', Validators.required]
		});

		if (!this.isAddMode) {
			this.bannerSizeService.getById(this.id)
				.pipe(first())
				.subscribe( (x) => {
					this.form.patchValue(x);
				});
		}
	}

	onSubmit() {
		this.submitted = true;

		// reset alerts on submit
		this.alertService.clear();

		// stop here if form is invalid
		if (this.form.invalid) {
			return;
		}

		this.loading = true;
		if (this.isAddMode) {
			this.createRecord();
		} else {
			this.updateRecord();
		}
	}

	public back(): void {
		this.location.back();
	}

	private onboarding(): void {

		this.introJS.setOptions({
			showStepNumbers: true,
			showProgress: true,

			steps: [
				{
					title: 'Template Banner Design',
					element: '#inputName',
					intro: "Enter a name for your creative size."
				},
				{
					element: '#inputDesc',
					intro: "Enter a description for the creative size.",
				},
				{
					element: '#inputWidth',
					intro: "Enter a width for the creative size.",
				},
				{
					element: '#inputHeight',
					intro: "Enter a description for the creative size.",
				},
				{
					element: '#btn-save',
					intro: "Click here to delete a creative size.",
				},
				{
					element: '#btn-cancel',
					intro: "Click here to cancel creation of a new creative size.",
				}
			]
		});
	}

	public help(): void {

		//this.introJS.refresh();

		//this.introJS.addHints();

		//this.introJS.showHints();

		this.introJS.start();
	}

	private createRecord() {
        this.bannerSizeService.create(this.form.value)
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
        this.bannerSizeService.update(this.id, this.form.value)
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

}
