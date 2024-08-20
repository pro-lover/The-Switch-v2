
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

	public dataInputValue: any[] = [];
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

		console.log('Template Banner Component Dialog ngOnInit for data:', this.dataBanner);
		console.log('Template Banner Component Dialog ngOnInit for Container:', this.dataContainer);
		console.log('Template Banner Component Dialog ngOnInit for Container:', this.dataContainer.components.length);
		console.log('Template Banner Component Dialog ngOnInit for Container:', this.dataContainer.components[1].componentmeta[9]);
		console.log('Template Banner Component Dialog ngOnInit for Container:', this.dataContainer.components);

		const _componentmetaUpdates: any[] = [];

		for (let x = 0; x < this.dataContainer.components.length; x++) {
	
			if(this.dataContainer.components[x].componenttype.name === 'Text' && this.dataContainer.components[x].smart === true)
			{
				_componentmetaUpdates.push(this.dataContainer.components[x])
	
			}
			
		}

		console.warn("name is text and smart is true; ",_componentmetaUpdates)

		for (let OutLoop = 0; OutLoop < _componentmetaUpdates.length; OutLoop++) {
			for (let i = 0; i < _componentmetaUpdates[OutLoop].componentmeta.length; i++) {
				if(_componentmetaUpdates[OutLoop].componentmeta[i].name === "fontValue")
					{
						//this.dataInputValue[OutLoop] = _componentmetaUpdates[OutLoop].componentmeta[i].value;
						this.dataInputValue.push(_componentmetaUpdates[OutLoop].componentmeta[i]);

						Object.defineProperty(this.dataInputValue[OutLoop], "nameId", {value:_componentmetaUpdates[OutLoop].name})
					}
			}
			
		}
		console.warn("All value to be updated on input field: " ,this.dataInputValue);

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

		console.warn("[Step 4] --> Entering onTextChange function here values ",value );
		console.warn("[Step 5] --> Entering onTextChange function here values ",this.dataComponents );

		for (let i = 0; i < this.dataComponents.length; i++) {
			
			if (this.dataComponents[i].componenttype.name === 'Text' && this.dataComponents[i].smart === true) {

				for (let o = 0; o < this.dataComponents[i].componentmeta.length; o++) {
					console.warn(i+' got it here ',this.dataComponents[i].name);
					if(this.dataComponents[i].componentmeta[o].name === "fontValue")
						{

							//var thisValue = this.dataComponents[i].name;

							this.dataComponents[i].componentmeta[o].value = value.value[this.dataComponents[i].name] ;

							console.warn("[Step 6] --> WAS UPDATE A SUCCESS   ");
							console.warn(this.dataComponents[i].componentmeta[o].value );

						}
				}
			}
		}
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
		console.warn("[Step 7] --> sending data to dasboard.page");

		this.uploadedFiles.push(uploadItem);

		this.UploadEvent.emit(uploadItem);

	}

}
