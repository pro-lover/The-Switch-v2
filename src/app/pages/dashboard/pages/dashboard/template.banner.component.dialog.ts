
import { Component, DoCheck, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AlertService, ComponentService, FontTypeService } from '@app/core/services';
import { Console } from 'console';
import { BehaviorSubject, Observable, Subject } from 'rxjs';


@Component({
	selector: 'app-component-variations',
	templateUrl: './template.banner.component.dialog.html',
	styleUrls: ['./template.banner.component.dialog.scss'],
})
export class TemplateBannerVariationsDialogComponent implements OnInit, OnDestroy, OnChanges, DoCheck {

	// will use the _destroy$ observable to control
	// fetching items from an observable
	private _destroy$ = new Subject<boolean>();
	logs: string[] = [];
	public dragPosition = { x: 0, y: 0 };

	//public id!: string;
	//public isAddMode!: boolean;
	public loading = false;
	public submitted = false;

	public copyContainerNeeded = false;

	public uploadedFiles: any = [];

	//
	@Input() dataBanner!: any;
	@Input() dataComponents!: any;
	@Input() dataContainer!: any;
	//@Input() dataTemplate!: Template;

	// Drag and Drop
	@Output() FDCEvent = new EventEmitter<any>();
	public uploadComplete = false;
	public dataInputValue!: any;
	//private uploadedItem: any;
	private uploadedFileSubject: BehaviorSubject<any[] | unknown>;
	public uploadedFileObs: Observable<any[] | unknown>;

	@Output() CloseEvent = new EventEmitter<any>();
	@Output() UploadEvent = new EventEmitter<any>();
	@Output() ResetEvent = new EventEmitter<any>();
	@Output() RemoveUploadEvent = new EventEmitter<any>();

	private resetVariationsSubject: BehaviorSubject<any>;
	public resetVariationsObs: Observable<any>;

	constructor(
		private dialog: MatDialog,
		private formBuilder: FormBuilder,
		private fontTypeService: FontTypeService,
		private alertService: AlertService,
		private componentService: ComponentService
	) {

		//this.editableComponentsSubject = new BehaviorSubject<boolean>(false);
		//this.editableComponentsObs = this.editableComponentsSubject.asObservable();

		this.uploadedFileSubject = new BehaviorSubject<any[] | unknown>(null);
		this.uploadedFileObs = this.uploadedFileSubject.asObservable();

		this.resetVariationsSubject = new BehaviorSubject<boolean>(false);
		this.resetVariationsObs = this.resetVariationsSubject.asObservable();
	}

	ngOnInit() {

		console.log('______________________________');

		console.log('Template Banner Component Dialog ngOnInit for Container:', this.dataContainer);
		console.log('Template Banner Component Dialog ngOnInit for Container:', this.dataContainer.components.length);
		console.log('Template Banner Component Dialog ngOnInit for Container:', this.dataContainer.components[1].componentmeta[9]);
		console.log('Template Banner Component Dialog ngOnInit for Container:', this.dataContainer.components[1].componentmeta[9].value);
		const _componentmeta = this.dataComponents.find( (component:any) => component.componenttype.name === 'Text' && component.smart === true );

		console.log(_componentmeta.componentmeta.length)

			for (let i = 0; i < _componentmeta.componentmeta.length; i++) {



			if(_componentmeta.componentmeta[i].name === "fontValue")
			{
				console.log("true is ")
				this.dataInputValue =_componentmeta.componentmeta[i].value;
			}
			}

			console.log(_componentmeta.componentmeta)




		this.isCopyDialogNeeded();

	}

	ngOnDestroy(): void {
		console.warn('Template Banner Component Dialog ngOnDestroy');
		this._destroy$.next(false);
		this._destroy$.complete();

		//this.scrollListener();
	}

	private isCopyDialogNeeded() {

		const getSmartTextComponents = this.dataComponents.find((component: any) => component.componenttype.name === 'Text' && component.smart === true);

		if (getSmartTextComponents) {
			this.copyContainerNeeded = true;
		}

	}

	public closeDialog() {
		this.CloseEvent.emit({
			'dataBanner': this.dataBanner,
			'dataContainer': this.dataContainer
		});
	}

	public saveDataOut(evt: any) {
		console.warn('look i am working', evt);
	}
	ngOnChanges(changes: SimpleChanges): void {

		console.warn('ngOnChanges  look i am working', changes);
	}
	ngDoCheck(): void {
		this.logs.push('ngDoCheck  look i am working');

	}
	

	public ListtrackByFn(index: number, item: any) {
		return index; // or item.id
	}

	public resetAssets(banner: any) {
		this.ResetEvent.emit({
			banner: banner,
			containerId: this.dataContainer.id
		});

		this.resetVariationsSubject.next({
			stage: 'bannerCanvas-' + banner.bannersize.width + '-' + banner.bannersize.height,
			banner: banner,
			containerId: this.dataContainer.id
		});

		this.uploadedFiles = [];
	}

	public removeAsset(removeItem: any) {

		//console.log('removeAsset:', removeItem );
		//console.log('uploadedFiles:', this.uploadedFiles );

		this.RemoveUploadEvent.emit(removeItem);

		/** /
		this.ResetEvent.emit(banner);

		this.resetVariationsSubject.next({
			stage: 'bannerCanvas-' + banner.bannersize.width + '-' + banner.bannersize.height,
			banner: banner
		});

		this.uploadedFiles = [];
		/**/
	}
	public onTextChange(value: any) {

		this.dataInputValue = value.value.text;

		console.warn('_______that to share____', value.value);
		

		const _componentmeta = this.dataComponents.find( (component:any) => component.componenttype.name === 'Text' && component.smart === true );
		console.warn('onTextChange : 1',_componentmeta);
			for (let i = 0; i < _componentmeta.componentmeta.length; i++) {
				if(_componentmeta.componentmeta[i].name === "fontValue")
				{
					
					_componentmeta.componentmeta[i].value = value.value.text ;
				}
			}
			console.warn('onTextChange : 3',_componentmeta.componentmeta );


			if (!value || !value.value.text) return;

			this.uploadComplete = true;

			this.broadcastUpdatedComponentInputChanges(value);
	}

	public DragAndDropEventItem(newItem: any) {
		console.log("TemplateBannerVariationsDialogComponent ________________________________________________________________[1]",);
		
		console.log(!newItem +'uploadItem  1:', newItem);
		console.log(!newItem.data[0]+'uploadItem:', newItem.data[0]);

		if (!newItem || !newItem.data[0]) return;

		this.uploadComplete = true;

		// always send last item in Array
		//this.uploadedItem = newItem.data[(newItem.data.length - 1)];

		this.broadcastUpdatedComponentInputChanges(newItem);

	}

	private broadcastUpdatedComponentInputChanges(uploadItem: any) {
		console.log("TemplateBannerVariationsDialogComponent ________________________________________________________________[2]",);

		this.uploadedFiles.push(uploadItem);

		this.UploadEvent.emit(uploadItem);

		//console.log('UploadEvent:', this.uploadedFiles);

	}

}
