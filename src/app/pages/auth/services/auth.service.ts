import { Injectable } from '@angular/core';
//import { AccountService, AlertService } from '@core/services';
import { getItem, removeItem, setItem, StorageItem } from '@core/utils';
import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root',
})
export class AuthService {

	isLoggedIn$ = new BehaviorSubject<boolean>(!!getItem(StorageItem.Auth));

	get isLoggedIn(): boolean {
		return this.isLoggedIn$.getValue();
	}

	signIn(): void {
		const token = Array(4)
		.fill(0)
		.map(() => Math.random() * 99)
		.join('-');

		setItem(StorageItem.Auth, token);
		this.isLoggedIn$.next(true);
	}

	signOut(): void {
		removeItem(StorageItem.Auth);
		this.isLoggedIn$.next(false);
	}

	/** /
	private login(details: any) {

		// reset alerts on submit
		this.alertService.clear();

        this.accountService.login(details.email, details.password)
            .pipe(first())
            .subscribe({
                next: () => {
                    // get return url from query parameters or default to home page
					const returnUrl = '/';
                    this.router.navigateByUrl(returnUrl);
                },
                error: error => {
                    this.alertService.error(error);
                }
            });

	}

	public logout() {
		removeItem(StorageItem.Auth);
		this.accountService.logout();
	}
	/**/
}
