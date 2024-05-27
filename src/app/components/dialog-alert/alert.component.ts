import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { NavigationStart, Router } from '@angular/router';
import { Alert, AlertType } from '@app/core/models';
import { AlertService } from '@app/core/services';
import { Subscription } from 'rxjs';


@Component({
	selector: 'app-alert',
	templateUrl: 'alert.component.html'
})
export class AlertComponent implements OnInit, OnDestroy {
	@Input() id = 'default-alert';
	@Input() fade = true;

	alerts: Alert[] = [];
	alertSubscription!: Subscription;
	routeSubscription!: Subscription;

	private horizontalPosition: MatSnackBarHorizontalPosition = "center";
	private verticalPosition: MatSnackBarVerticalPosition = "top";

	constructor(
		private router: Router,
		private alertService: AlertService,
		private _snackBar: MatSnackBar,
		) { }

	private openSnackBar(message: string, action: string, options?: any){
		this._snackBar.open(message, action, options);
	}

	ngOnInit() {
		// subscribe to new alert notifications
		this.alertSubscription = this.alertService.onAlert(this.id)
			.subscribe(alert => {
				// clear alerts when an empty alert is received
				if (!alert.message) {
					// filter out alerts without 'keepAfterRouteChange' flag
					this.alerts = this.alerts.filter(x => x.keepAfterRouteChange);

					// remove 'keepAfterRouteChange' flag on the rest
					this.alerts.forEach(x => delete x.keepAfterRouteChange);
					return;
				}

				/*add alert to array
				this.alerts.push(alert);

				// auto close alert if required
				if (alert.autoClose) {
				    setTimeout(() => this.removeAlert(alert), 3000);
				}*/

				this.openSnackBar(
					alert.message,
					'Close',
					{
						horizontalPosition:	this.horizontalPosition,
						verticalPosition: this.verticalPosition,
						duration: (alert.autoClose) ? 5000 : false,
						panelClass: this.cssClasses(alert)
					}
				);
			});

		// clear alerts on location change
		this.routeSubscription = this.router.events.subscribe(event => {
			if (event instanceof NavigationStart) {
				this.alertService.clear(this.id);
			}
		});
	}



	ngOnDestroy() {
		// unsubscribe to avoid memory leaks
		this.alertSubscription.unsubscribe();
		this.routeSubscription.unsubscribe();
	}

	removeAlert(alert: Alert) {
		// check if already removed to prevent error on auto close
		if (!this.alerts.includes(alert)) return;

		if (this.fade) {
			// fade out alert
			alert.fade = true;

			// remove alert after faded out
			setTimeout(() => {
				this.alerts = this.alerts.filter(x => x !== alert);
			}, 250);
		} else {
			// remove alert
			this.alerts = this.alerts.filter(x => x !== alert);
		}
	}

	cssClasses(alert: Alert) {
		if (!alert) return;
		const classes = ['alert', 'alert-dismissable'];

		const alertTypeClass = {
			[AlertType.Success]: 'alert-success',
			[AlertType.Error]: 'alert-danger',
			[AlertType.Info]: 'alert-info',
			[AlertType.Warning]: 'alert-warning'
		}

		classes.push(alertTypeClass[alert.type]);

		if (alert.fade) {
			classes.push('fade');
		}

		return classes;
		//return classes.join(' ');
	}
}
