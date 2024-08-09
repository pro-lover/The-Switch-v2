import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AlertService, BannerCreatorService, ContainerService } from '@app/core/services';

@Component({
	selector: 'app-container-add-dialog',
	templateUrl: 'dialog.container.add.html',
	styleUrls: ['dialog.container.add.scss']
})

export class DialogBannerContainerAddComponent {

	public title!: string;
	public message!: string;

	public passContainer: any;

	constructor(
		private alertService: AlertService,
		private bannerCreatorService: BannerCreatorService,
		private containerService: ContainerService,
		public dialogRef: MatDialogRef<DialogBannerContainerAddComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {
		//console.log('DialogBannerContainerAddComponent:', this.data);
	}

	public passContainerFromDialog(component: any) {

		////console.log('Adding Component From Dialog:', component);

		this.passContainer = component;

		this.dialogRef.close(this.passContainer);
	}

}
