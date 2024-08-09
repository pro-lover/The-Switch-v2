import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlertService, BannerCreatorService } from '@app/core/services';

@Component({
	selector: 'app-component-add-dialog',
	templateUrl: 'dialog.component.add.html',
	styleUrls: ['dialog.component.add.scss']
})

export class DialogBannerComponentAddComponent {

	public title!: string;
	public message!: string;

	public passComponent: any;

	constructor(
		private alertService: AlertService,
		private bannerCreatorService: BannerCreatorService,
		public dialogRef: MatDialogRef<DialogBannerComponentAddComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {


	}

	public passComponentFromDialog(component: any) {

		////console.log('Adding Component From Dialog:', component);

		this.passComponent = component;

		this.dialogRef.close(this.passComponent);
	}

}
