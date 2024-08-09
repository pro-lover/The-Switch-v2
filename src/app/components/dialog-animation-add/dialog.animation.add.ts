import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlertService } from '@app/core/services';

@Component({
	selector: 'app-animation-add-dialog',
	templateUrl: 'dialog.animation.add.html',
	styleUrls: ['dialog.animation.add.scss']
})

export class DialogBannerContainerAnimationAddComponent {

	public title!: string;
	public message!: string;

	public passAnimation: any;

	constructor(
		private alertService: AlertService,
		public dialogRef: MatDialogRef<DialogBannerContainerAnimationAddComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
		//console.log('DialogBannerContainerAnimationAddComponent:', this.data);
	}

	public passAnimationFromDialog(component: any) {

		////console.log('Adding Animation to Component From Dialog:', component);

		this.passAnimation = component;

		this.dialogRef.close(this.passAnimation);
	}

}
