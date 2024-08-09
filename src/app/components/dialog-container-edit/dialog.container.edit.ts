import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlertService } from '@app/core/services';

@Component({
	selector: 'app-container-edit-dialog',
	templateUrl: 'dialog.container.edit.html',
	styleUrls: ['dialog.container.edit.scss']
})

export class DialogBannerContainerEditComponent {

	public title!: string;
	public message!: string;

	public passContainer: any;

	constructor(
		private alertService: AlertService,
		public dialogRef: MatDialogRef<DialogBannerContainerEditComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
		////console.log('DialogBannerContainerEditComponent:', this.data);
	}

	public passContainerFromDialog(component: any) {

		////console.log('Adding Component From Dialog:', component);

		this.passContainer = component;

		this.dialogRef.close(this.passContainer);
	}

}
