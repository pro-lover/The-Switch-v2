import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'app-confirm-dialog',
	templateUrl: 'dialog.confirm.component.html',
	styleUrls: ['dialog.confirm.component.scss']
})

export class DialogConfirmComponent  implements OnInit {

	title!: string;
  	message!: string;

	projectId!: any[];
	roleName!: string;

	constructor(
		//private formBuilder: FormBuilder,
		public dialogRef: MatDialogRef<DialogConfirmComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {


	}

	ngOnInit() {
		if( this.data.type === undefined ) {
			this.data.type = 'default';
		} else {
			//remove existing account role
			if( this.data.roles !== undefined ) {
				for( let i = 0; i < this.data.roles.length; i++){

					if ( this.data.roles[i] === this.data.accountRole) {
						this.data.roles.splice(i, 1);
						i--;
					}
				}
			}
			//console.log('data.accountRole:', this.data.roles);
		}
	}

	public onChange (action:string): void {
		//console.log('New Project selected:', this.projectId );
	}

}
