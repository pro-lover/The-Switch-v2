import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService, AlertService } from '@app/core/services';
import { first } from 'rxjs/operators';


enum EmailStatus {
    Verifying,
    Failed
}

@Component({ templateUrl: './verify-email.page.html' })
export class VerifyEmailPage implements OnInit {
	EmailStatus = EmailStatus;
	emailStatus = EmailStatus.Verifying;

	constructor(
		private route: ActivatedRoute,
		private router: Router,
		private accountService: AccountService,
		private alertService: AlertService
	) { }

    ngOnInit() {
		const token = this.route.snapshot.queryParams['token'];

		// remove token from url to prevent http referer leakage
		this.router.navigate([], { relativeTo: this.route, replaceUrl: true });

		this.accountService.verifyEmail(token)
			.pipe(first())
			.subscribe({
				next: () => {
					this.alertService.success('Verification successful, you can now login', { keepAfterRouteChange: true });
					this.router.navigate(['../login'], { relativeTo: this.route });
				},
				error: () => {
					this.emailStatus = EmailStatus.Failed;
				}
			});
    }
}
