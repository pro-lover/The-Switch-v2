import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Account } from '@app/core/models';
import { environment } from '@env/environment';
import { AuthService } from '@pages/auth/services/auth.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

const baseUrl = `${environment.apiUrl}/accounts`;

@Injectable({ providedIn: 'root' })
export class AccountService {
	private accountSubject: BehaviorSubject<unknown>;
	public account: Observable<unknown>;

	constructor(
		private authService: AuthService,
		private router: Router,
		private http: HttpClient
	) {
		this.accountSubject = new BehaviorSubject<unknown>(null);
		this.account = this.accountSubject.asObservable();
	}

	public get accountValue(): any {
		return this.accountSubject.value;
	}

	login(email: string, password: string) {

		//console.log('AccountService.login()', email, password);

		return this.http.post<Account>(`${baseUrl}/authenticate`, { email, password }, { withCredentials: true })
			.pipe(map(account => {
				this.authService.isLoggedIn$.next(true);
				this.accountSubject.next(account);
				this.startRefreshTokenTimer();
				return account;
			}));
	}

	logout() {
		this.http.post<unknown>(`${baseUrl}/revoke-token`, {}, { withCredentials: true }).subscribe();
		this.stopRefreshTokenTimer();
		this.authService.isLoggedIn$.next(false);
		this.accountSubject.next(null);
		//this.router.navigate(['/account/login']);
	}

	verifyRecaptchaToken(token: string, secret: string) {
		return this.http.post(`${baseUrl}/recaptcha-verify`, { token, secret }, { withCredentials: true });
		//return this.http.post(`https://www.google.com/recaptcha/api/siteverify`, { token }, { withCredentials: true });
	}

	requestRole(account: Account, role: string) {
		return this.http.post(`${baseUrl}/request-role`, { account, role });
	}

	refreshToken() {
		return this.http.post<any>(`${baseUrl}/refresh-token`, {}, { withCredentials: true })
			.pipe(map((account) => {
				this.accountSubject.next(account);
				this.startRefreshTokenTimer();
				return account;
			}));
	}

	register(account: Account) {
		return this.http.post(`${baseUrl}/register`, account);
	}

	verifyEmail(token: string) {
		return this.http.post(`${baseUrl}/verify-email`, { token });
	}

	forgotPassword(email: string) {
		return this.http.post(`${baseUrl}/forgot-password`, { email });
	}

	validateResetToken(token: string) {
		return this.http.post(`${baseUrl}/validate-reset-token`, { token });
	}

	resetPassword(token: string, password: string, confirmPassword: string) {
		return this.http.post(`${baseUrl}/reset-password`, { token, password, confirmPassword });
	}

	getAll() {
		return this.http.get<Account[]>(baseUrl);
	}

	getById(id: string) {
		return this.http.get<Account>(`${baseUrl}/${id}`);
	}

	create(params: any) {
		return this.http.post(baseUrl, params);
	}

    update(id: number, params: any) {
		return this.http.put(`${baseUrl}/${id}`, params)
			.pipe(map((account: any) => {
				// update the current account if it was updated
				if (account.id === this.accountValue.id) {
					// publish updated account to subscribers
					account = { ...this.accountValue, ...account };
					this.accountSubject.next(account);
				}
				return account;
			}));
	}

	updateStatus(id: number, params: any) {
		return this.http.put(`${baseUrl}/${id}/update-status`, params)
			.pipe(map((account: any) => {
				// update the current account if it was updated
				if (account.id === this.accountValue.id) {
					// publish updated account to subscribers
					account = { ...this.accountValue, ...account };
					this.accountSubject.next(account);
				}
				return account;
			}));
	}

	restore(id: number) {
		return this.http.put(`${baseUrl}/${id}/restore`, {})
		.pipe(map((account: any) => {
			if (account.id === this.accountValue.id) {
				// publish updated account to subscribers
				account = { ...this.accountValue, ...account };
				this.accountSubject.next(account);
			}
			return account;
		}));
	}

	delete(id: string) {
		return this.http.delete(`${baseUrl}/${id}`)
			.pipe(finalize(() => {
				// auto logout if the logged in account was deleted
				if (id === this.accountValue.id)
					this.logout();
			}));
	}

    // helper methods

	private refreshTokenTimeout: any;

	private startRefreshTokenTimer() {
		// parse json object from base64 encoded jwt token
		const jwtToken = JSON.parse(atob(this.accountValue.jwtToken.split('.')[1]));

		// set a timeout to refresh the token a minute before it expires
		const expires = new Date(jwtToken.exp * 1000);
		const timeout = expires.getTime() - Date.now() - (60 * 1000);
		this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
	}

	private stopRefreshTokenTimer() {
		clearTimeout(this.refreshTokenTimeout);
	}
}
