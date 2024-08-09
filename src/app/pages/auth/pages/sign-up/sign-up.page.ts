import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService, AlertService } from '@app/core/services';
import { MustMatch } from '@app/shared/validator';
import { first } from 'rxjs/operators';


@Component({
	templateUrl: './sign-up.page.html',
	styleUrls: ['./sign-up.page.scss'],
})
export class SignUpPage implements OnInit {

	public form!: FormGroup;
	public loading = false;
	public submitted = false;

	constructor(
		private formBuilder: FormBuilder,
		private route: ActivatedRoute,
		private router: Router,
		private accountService: AccountService,
		private alertService: AlertService
	) { }

	// convenience getter for easy access to form fields
	get f() { return this.form.controls; }

	ngOnInit() {
		this.form = this.formBuilder.group({
			title: ['', Validators.required],
			firstName: ['', Validators.required],
			lastName: ['', Validators.required],
			email: ['', [Validators.required, Validators.email]],
			password: ['', [Validators.required, Validators.minLength(6)]],
			confirmPassword: ['', Validators.required],
			acceptTerms: [false, Validators.requiredTrue]
		}, {
			validator: MustMatch('password', 'confirmPassword')
		});
	}

	onSubmit() {
		this.submitted = true;

		// reset alerts on submit
		this.alertService.clear();

		// stop here if form is invalid
		if (this.form.invalid) {
			this.alertService.error('An Error Occurred. Please ensure all fields are completed.');
			//console.error('Registering Error:', this.form.value);
			return;
		}

		//console.log('Registering...', this.form.value);

		this.loading = true;
		this.accountService.register(this.form.value)
			.pipe(first())
			.subscribe({
				next: () => {
					this.alertService.success('Registration successful, please check your email for verification instructions', { keepAfterRouteChange: true });
					this.router.navigate(['../login'], { relativeTo: this.route });
				},
				error: error => {
					this.alertService.error(error);
					this.loading = false;
				}
			});
	}

}
