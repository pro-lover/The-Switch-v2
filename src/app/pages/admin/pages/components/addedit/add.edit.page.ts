import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Account, Role } from '@app/core/models';
import { AccountService, AlertService, ComponentService } from '@app/core/services';
import * as introJs from 'intro.js';
import { first } from 'rxjs/operators';

@Component({
	templateUrl: './add.edit.page.html',
	styleUrls: ['./add.edit.page.scss'],
})
export class ComponentsAddEditPage implements OnInit {

	//user onboarding
	private introJS = introJs();

	form!: FormGroup;
	id!: string;
	isAddMode!: boolean;
	loading = false;
	submitted = false;

	Role = Role;
	componentModel!: any;
	account!: Account;

	constructor(
		private formBuilder: FormBuilder,
		private route: ActivatedRoute,
		private router: Router,
		private dialog: MatDialog,
		private location: Location,
		private accountService: AccountService,
		private componentService: ComponentService,
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
			componentId: ['', Validators.required],
			containerId: ['', Validators.required],
			componenttypeId: ['', Validators.required],
			name: ['', Validators.required],
			description: ['', Validators.required],
			smart: ['', Validators.required],
			status: ['', Validators.required]
		});

		if (!this.isAddMode) {
			this.componentService.getById(this.id)
				.pipe(first())
				.subscribe((x) => {
					//console.log('Component: ', x);
					this.componentModel = x;
					this.form.patchValue(x);
					this.f['componentId'].patchValue(x.id);
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
					title: 'Add Creative Type',
					element: '#btn-back',
					intro: "Click here to go back to previous page."
				},
				{
					element: '#inputName',
					intro: "Enter a name for your creative type.",
				},
				{
					element: '#inputDesc',
					intro: "Enter a description for your creative type.",
				},
				{
					element: '#btn-save',
					intro: "Click here to save new creative type.",
				},
				{
					element: '#btn-cancel',
					intro: "Click here to cancel creating a new creative type.",
				},
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
		this.componentService.create(this.form.value)
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
		this.componentService.update(this.id, this.form.value)
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
