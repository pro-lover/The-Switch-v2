import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Account, Role } from '@app/core/models';
import { AccountService, AlertService } from '@app/core/services';
import { MustMatch } from '@app/shared/validator';
import * as introJs from 'intro.js';
import { first } from 'rxjs/operators';

@Component({
	templateUrl: './add.edit.page.html',
	styleUrls: ['./add.edit.page.scss'],
})
export class AccountsAddEditPage implements OnInit {

	form!: FormGroup;
	id: string | any[string];
	projectId!: number;
	isAddMode!: boolean;
	loading = false;
	submitted = false;

	Role = Role;
	account: Account;

	//user onboarding
	private introJS = introJs();

	constructor(
		private formBuilder: FormBuilder,
		private route: ActivatedRoute,
		private router: Router,
		private dialog: MatDialog,
		private location: Location,
		private accountService: AccountService,
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
			title: ['', Validators.required],
			firstName: ['', Validators.required],
			lastName: ['', Validators.required],
			email: ['', [Validators.required, Validators.email]],
			role: ['', Validators.required],
			password: ['', [Validators.minLength(6), this.isAddMode ? Validators.required : Validators.nullValidator]],
			confirmPassword: [''],
			accountId: [this.id]
		}, {
			validator: MustMatch('password', 'confirmPassword')
		});

		if (!this.isAddMode) {
			this.accountService.getById(this.id)
				.pipe(first())
				.subscribe((x) => {
					this.form.patchValue(x);
					if (this.account.id === x.id) {
						this.f['role'].disable();
					}
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
			this.createAccount();
		} else {
			this.updateAccount();
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
					intro: 'Click here to go back to previous page.',
					element: '#btn-back'
				},
				{
					title: 'Create Account.',
					intro: 'Click here to select a title',
					element: '#select-drp'
				},
				{
					intro: "Enter user's first name.",
					element: '#inputName'
				},
				{
					intro: "Enter user's last name.",
					element: '#inputLName'
				},
				{
					intro: "Enter user's email address.",
					element: '#inputEmail'
				},
				{
					intro: "Click here to select a user's role",
					element: '#role-drp'
				},
				{
					intro: "Enter user's password.",
					element: '#inputPassword'
				},
				{
					intro: "Re-enter password to confirm it.",
					element: '#inputConfirmP'
				},
				{
					intro: "Click here to save new user.",
					element: '#btn-save'
				},
				{
					intro: "Click here to cancel creation of new user.",
					element: '#btn-cancel'
				}
			],
		});
	}

	public help(): void {

		//this.introJS.refresh();

		//this.introJS.addHints();

		//this.introJS.showHints();

		this.introJS.start();
	}

	private createAccount() {
		this.accountService.create(this.form.value)
			.pipe(first())
			.subscribe({
				next: () => {
					this.alertService.success('Account created successfully', { keepAfterRouteChange: true });
					this.router.navigate(['../'], { relativeTo: this.route });
				},
				error: error => {
					this.alertService.error(error);
					this.loading = false;
				}
			});
	}

	private updateAccount() {
		////console.log('updateAccount', this.form.value);
		//return
		this.accountService.update(this.id, this.form.value)
			.pipe(first())
			.subscribe({
				next: () => {
					this.alertService.success('Update successful', { keepAfterRouteChange: true });

					if (this.account.role === 'Admin') {
						this.router.navigate(['../../'], { relativeTo: this.route });
					} else {
						this.location.back();
					}
				},
				error: error => {
					this.alertService.error(error);
					this.loading = false;
				}
			});
	}

}
