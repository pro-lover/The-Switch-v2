import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService, AlertService } from '@app/core/services';
import { finalize, first } from 'rxjs/operators';


@Component(
	{
		templateUrl: './forgot-password.page.html',
		styleUrls: ['./forgot-password.page.scss'],
	}
)
export class ForgotPasswordPage implements OnInit {
	form!: FormGroup;
	loading = false;
	submitted = false;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private formBuilder: FormBuilder,
		private accountService: AccountService,
		private alertService: AlertService
	) { }

	ngOnInit() {
		this.form = this.formBuilder.group({
			email: ['', [Validators.required, Validators.email]]
		});
	}

	// convenience getter for easy access to form fields
	get f() { return this.form.controls; }

	onSubmit() {
		this.submitted = true;

		// reset alerts on submit
		this.alertService.clear();

		// stop here if form is invalid
		if (this.form.invalid) {
			return;
		}

		this.loading = true;
		this.alertService.clear();
		this.accountService.forgotPassword(this.f['email'].value)
			.pipe(first())
			.pipe(finalize(() => this.loading = false))
			.subscribe({
				next: () => {
					this.alertService.success('Please check your email for password reset instructions', { keepAfterRouteChange: true });
					this.router.navigate(['../login'], { relativeTo: this.route });
				},
				error: (error) => {
					this.alertService.error(error)
				}
			});
	}
}

