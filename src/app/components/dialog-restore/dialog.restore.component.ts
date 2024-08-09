import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'app-restore-dialog',
	templateUrl: 'dialog.restore.component.html',
	styleUrls: ['dialog.restore.component.scss']
})

export class DialogRestoreComponent implements OnInit {

	title!: string;
	message!: string;

	projectId!: any[];
	roleName!: string;

	constructor(
		//private formBuilder: FormBuilder,
		public dialogRef: MatDialogRef<DialogRestoreComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {


	}

	ngOnInit() {
		//console.log('DialogRestoreComponent:', this.data);
	}
}
