import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService, AlertService } from '@app/core/services';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import { environment } from '@env/environment';
import { first } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
  templateUrl: './sign-in.page.html',
  styleUrls: ['./sign-in.page.scss'],
})
export class SignInPage implements OnInit {

	public path = ROUTER_UTILS.config;

	public form: FormGroup | any;
    public loading = false;
    public submitted = false;
	public returnUrl: string;

	constructor(
		private formBuilder: FormBuilder,
		private router: Router,
		private activatedRoute: ActivatedRoute,
        private accountService: AccountService,
		private sanitizer: DomSanitizer,
		private authService: AuthService,
		private alertService: AlertService
	) {
		this.returnUrl = this.activatedRoute.snapshot.queryParamMap.get('returnUrl') || `/${ROUTER_UTILS.config.base.home}`;
	}

	// convenience getter for easy access to form fields
	get f() { return this.form.controls; }

	ngOnInit() {
		this.form = this.formBuilder.group({
			email: ['', [Validators.required, Validators.email]],
			password: ['', Validators.required]
		});
	}

	onClickSignIn(): void {
		this.authService.signIn();
		this.router.navigate([this.returnUrl]);
	}

	private login() {
		this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.form.invalid) {
			this.alertService.error('An Error Occurred. Please ensure all fields are completed.');
			console.error('Login Error:', this.form.value);
            return;
        }

		this.loading = true;
        this.accountService.login(this.f.email.value, this.f.password.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    // get return url from query parameters or default to home page
					//let qquickie = this.route.snapshot.queryParams['returnUrl'] || '/';
                    //const returnUrl = this.sanitizer.sanitize( SecurityContext.URL, qquickie);
					const returnUrl = '/';
                    this.router.navigateByUrl(returnUrl);
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });

	}

    public onSubmit() {
        this.submitted = true;

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.form.invalid) {
            return;
        }

		this.loading = true;

		this.login();
		//this.recaptchaService.execute({action: 'login'});

		return;
    }

	public onCaptchaExpired(event: any): void {
		//console.log('onCaptchaExpired:', event);
	}

	public onCaptchaResponse(token: any): void {
		//console.log('onCaptchaResponse:', token);

		this.accountService.verifyRecaptchaToken(token, environment.recaptchaSecret ).pipe(first())
            .subscribe({
                next: (RecaptchaResponse) => {
                    //console.log('RecaptchaResponse:', RecaptchaResponse);

					this.login();
                },
                error: error => {

					this.alertService.error(error);
                    this.loading = false;
                }
            });
	}
}
