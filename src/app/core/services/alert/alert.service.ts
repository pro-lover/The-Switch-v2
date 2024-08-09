import { Injectable } from '@angular/core';
//import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { Alert, AlertType } from '@app/core/models';
import { Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';


@Injectable({
	providedIn: 'root'
})
export class AlertService {
	private subject = new Subject<Alert>();
	private defaultId = 'default-alert';

	private snackBarRef?: any;

	//horizontalPosition: MatSnackBarHorizontalPosition = 'center';
	//verticalPosition: MatSnackBarVerticalPosition = 'top';

	constructor(
		//private _snackBar: MatSnackBar
	) {
		/** /
		this.snackBarRef = this._snackBar;

		this.snackBarRef.afterDismissed().subscribe(() => {
			//console.log('The snackbar was dismissed');
		});


		this.snackBarRef.onAction().subscribe(() => {
			//console.log('The snackbar action was triggered!');
		});
		/**/

	}

	// enable subscribing to alerts observable
	onAlert(id = this.defaultId): Observable<Alert> {
		return this.subject.asObservable().pipe(filter(x => x && x.id === id));
	}

	// convenience methods
	success(message: string, options?: any) {
		this.alert(new Alert({ ...options, type: AlertType.Success, message }));
	}

	error(message: string, options?: any) {
		this.alert(new Alert({ ...options, type: AlertType.Error, message }));

		/** /
		this._snackBar.open( message, 'close', {
			horizontalPosition: this.horizontalPosition,
			verticalPosition: this.verticalPosition,
			panelClass: ['failure-snackbar']
		});
		/**/

	}

	info(message: string, options?: any) {
		this.alert(new Alert({ ...options, type: AlertType.Info, message }));
	}

	warn(message: string, options?: any) {
		this.alert(new Alert({ ...options, type: AlertType.Warning, message }));
	}

	// core alert method
	alert(alert: Alert) {
		alert.id = alert.id || this.defaultId;
		alert.autoClose = (alert.autoClose === undefined ? true : alert.autoClose);
		this.subject.next(alert);
	}

	// clear alerts
	clear(id = this.defaultId) {
		this.subject.next(new Alert({ id }));
	}
}
