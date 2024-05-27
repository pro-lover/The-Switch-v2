import { DatePipe } from '@angular/common';
import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
	selector: 'app-version-control-dialog',
	templateUrl: 'dialog.versioncontrol.component.html',
	styleUrls: ['dialog.versioncontrol.component.scss'],
	providers: [DatePipe]
})

export class DialogVersionControlComponent  implements OnInit, OnDestroy {

	@ViewChild('tableDataSet') tabledbset!: ElementRef;

	title!: string;
  	message!: string;
	notice!: string;

	constructor(
		private datePipe: DatePipe,
		public dialogRef: MatDialogRef<DialogVersionControlComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any
	) {


	}

	ngOnInit() {
		if( this.data.type === undefined ) {
			this.data.type = 'default';
		}

		console.log('data:', this.data);

		if( this.data.history.length === 0 ) {
			this.notice = 'No version history available';
			//this.data.history.push(this.data.latest);
		}
	}

	ngAfterViewInit()
	{
		//let that = this;

		if( this.data.history.length > 0 ) {
			this.generateTableContents();

			this.tabledbset.nativeElement.querySelectorAll('button').forEach( (el:any,index:number) => {
				el.addEventListener( 'click', (evt:any) =>{
					this.restore(evt.target.getAttribute('data-id'), evt.target.getAttribute('data-hid'));
				});
			});
		}
	}

	ngOnDestroy() {
		console.info('DialogVersionControlComponent ngOnDestroy:');
	}

	public onChange (action:string): void {
		//console.log('New Project selected:', this.projectId );
	}

	public restore ( id:string|number, hid:string|number ): void {

		const restorHistory = this.data.history.find((x:any) => x.hid == hid);

		console.log('Restore:', this.data.model, id, hid, restorHistory );

		this.dialogRef.close(restorHistory);
	}

	private generateTableContents(): void {

		//let that = this;

		const obj = this.data.history;
		const thead = this.tabledbset.nativeElement.querySelector('thead');
		const tbody = this.tabledbset.nativeElement.querySelector('tbody');

		// create table headings:
		const keys = Object.keys(obj[0]);
		let thr = "";
		thr = "<tr>";
		keys.forEach((key:any,index:number) => {
			thr += "<th>" + key.toUpperCase() + "</th>";
		});
		thr += "<th></th>";
		thr += "</tr>";
		thead.innerHTML += thr;

		// create table body:
		let tr = "";
		obj.forEach( (item:any,index:number) => {
			tr += "<tr>";
			Object.keys(item).forEach((key,indexx) => {
				tr += "<td>" + ( ( key === 'created' || key === 'updated' || key === 'archivedAt' ) ? this.datePipe.transform(item[key], 'yyyy-MM-dd h:mm:ss a' ) : item[key] ) + "</td>";
			});
			tr += `<td>
				<button class="btn btn-sm btn-primary restore-history" data-id="${item.id}" data-hid="${item.hid}">Restore</button>
			</td>`;
			tr += "</tr>";

		});

		tbody.innerHTML += tr;
	}

}
