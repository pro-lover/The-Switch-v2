import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AlertService } from '@app/core/services';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
	selector: 'app-draganddrop',
	templateUrl: './draganddrop.component.html',
	styleUrls: ['./draganddrop.component.scss'],
})
export class DragandDropComponent implements OnInit, OnDestroy {

	// will use the _destroy$ observable to control
	// fetching items from an observable
	private _destroy$ = new Subject<boolean>();

	public filesForVisualUI: any[] = [];
	public files: any[] = [];
	public path = ROUTER_UTILS.config.base;

	@Output() DDEvent = new EventEmitter<any>();
	@Input() dataStageName!: string;
	@Input() dataType!: string;
	@Input() componentName!: string;
	@Input() dataContainerId!: number | string;

	@Input() resetUploads!: any;

	//@Output() resetUploadsChange = new EventEmitter<any>();
	@Output() removeUpload = new EventEmitter<any>();

	//private uploadedFileSubject: BehaviorSubject<any[]>;
	//public uploadedFileObs: Observable<any[]>;

	constructor(
		private elementRef: ElementRef,
		private alertService: AlertService,
	) {
		//this.uploadedFileSubject = new BehaviorSubject<any[]>([]);
		//this.uploadedFileObs = this.uploadedFileSubject.asObservable();
		//this.resetVariationsSubject = new BehaviorSubject<boolean>(false);
		//this.resetVariationsObs = this.resetVariationsSubject.asObservable();
	}

	ngOnInit() {
		/**/
		this.resetUploads.pipe(takeUntil(this._destroy$)).subscribe((evt:any) => {

			//console.log('DND clear files:', evt);

			if (!evt || !evt.stage) return;

			if( this.dataStageName == evt.stage ) {
				//console.log('DND clear files:', evt);
				this.files = [];
				this.files.length = 0;

				this.filesForVisualUI = [];
				this.filesForVisualUI.length = 0;
			}

		});
		//}
	}

	ngOnDestroy(): void {
		console.warn('DragandDrop Component ngOnDestroy');
		this._destroy$.complete();
		this._destroy$.unsubscribe();
	}

	/**
	 * on file drop handler
	 */
	public onFileDropped($event: any) {
		this.prepareFilesList($event);
	}

	/**
	 * handle file from browsing
	 */
	public fileBrowseHandler(files: Event | any) {
		//this.prepareFilesList(files);
		this.prepareFilesList(files.target.files);
	}

	/**
	 * Delete file from files list
	 * @param index (File index)
	 */
	public deleteFile(index: number) {
		const removedFile = this.files.splice(index, 1);
		this.filesForVisualUI.splice(index, 1);

		this.removeUpload.emit({
			stage: this.dataStageName,
			containerId: this.dataContainerId,
			type: this.dataType,
			componentName: this.componentName,
			data: removedFile
		});
	}

	/**
	 * Simulate the upload process
	 */
	private uploadFilesSimulator(index: number) {

		//setTimeout(() => {
			if (index === this.files.length) {
				this.DDEvent.emit({
					stage: this.dataStageName,
					containerId: this.dataContainerId,
					type: this.dataType,
					componentName: this.componentName,
					data: this.files
				});
				return;
			} else {
				const progressInterval = setInterval(() => {
					if (this.files[index].progress === 100) {
						clearInterval(progressInterval);
						this.uploadFilesSimulator(index + 1);
					} else {
						this.files[index].progress += 50;
					}
				}, 200);
			}
		//}, 1000);
	}

	/**
	 * Convert Files list to normal array list
	 * @param files (Files List)
	 */
	private prepareFilesList(files: Array<any>) {

		//console.log('files:', files);

		// Copy Validation: One Spreadsheet File at a time Only

		if( this.dataType.toLowerCase() === 'copy' || this.dataType.toLowerCase() === 'text' ) {

			if( this.files.length > 0 ) {

				this.alertService.error('A Spreadsheet is already uploaded. Please delete the existing file first.', { keepAfterRouteChange: true });

				return;

			} else if( files.length > 1 ) {

				this.alertService.error('Only one spreadsheet file at a time is supported.', { keepAfterRouteChange: true });

				return;

			}

		}

		this.files.length = 0;

		for (const item of files) {

			if( this.validFileType(item) ) {

				item.progress = 0;
				this.files.push(item);
				this.filesForVisualUI.push(item);
				//this.uploadFilesSimulator((this.files.length - 1));

				this.elementRef.nativeElement.querySelector('.drag-and-drop-container').classList.remove('error');
				this.elementRef.nativeElement.querySelector('.drag-and-drop-container').classList.add('success');

			} else {

				console.error('Invalid file['+this.dataType+'] type:', item.type);

				this.alertService.error('Invalid '+this.dataType+' File for ' + this.componentName, { keepAfterRouteChange: true });

				this.elementRef.nativeElement.querySelector('.drag-and-drop-container').classList.remove('success');
				this.elementRef.nativeElement.querySelector('.drag-and-drop-container').classList.add('error');

			}
		}

		if( this.files.length > 0 ) {
			this.uploadFilesSimulator(0);
		}

	}

	private validFileType(file:File): boolean {

		switch (this.dataType.toLowerCase()) {

			case 'image':
			case 'logo':
			case 'background':
				console.log('file type:', file.type);

				if( file.type.match('image.*') ) {
					return true;
				} else {
					return false;
				}

			case 'copy':
			case 'text':

				if( file.type.match('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ) {
					return true;
				} else {
					return false;
				}

			default:

				return false;

		}

	}

	/**
	 * format bytes
	 * @param bytes (File size in bytes)
	 * @param decimals (Decimals point)
	 */
	formatBytes(bytes: number, decimals: number) {
		if (bytes === 0) {
			return '0 Bytes';
		}
		const k = 1024;
		const dm = decimals <= 0 ? 0 : decimals || 2;
		const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
	}

}
