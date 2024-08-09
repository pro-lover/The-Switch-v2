import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlertService, BannerCreatorService } from '@app/core/services';

@Component({
	selector: 'app-component-duplicate-dialog',
	templateUrl: 'dialog.component.duplicate.html',
	styleUrls: ['dialog.component.duplicate.scss']
})

export class DialogBannerComponentDuplicateComponent {

	public title!: string;
	public message!: string;

	public passComponent: any;

	constructor(
		private alertService: AlertService,
		private bannerCreatorService: BannerCreatorService,
		public dialogRef: MatDialogRef<DialogBannerComponentDuplicateComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {


	}

	public passComponentFromDialog(component: any) {

		////console.log('Adding Component From Dialog:', component);

		this.passComponent = component;

		this.dialogRef.close(this.passComponent);
	}

}
