import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { AlertService } from '@app/core/services';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
	selector: 'app-inputText',
	templateUrl: './inputText.component.html',
	styleUrls: ['./inputText.component.scss'],
})
export class InputTextComponent implements OnInit, OnDestroy {



	@Output() inputEvent = new EventEmitter<any>();

	@Input() dataInputValue: any[] = [];
	@Input() dataContainerComponents: any;
	@Input() dataStageName!: string;
	@Input() bannerType!: string;
	@Input() dataType!: string;
	@Input() componentName!: string;
	@Input() dataContainerId!: number | string;

	logs: string[] = [];

	constructor(

	) {

	}

	ngOnInit() {
		console.log("bannerType-_____________________[1]", this.bannerType);
		console.log("InputTextComponent-_____________________[1]", this.dataInputValue);
		console.log("componentName -_____________________[1]", this.componentName);
		console.log("dataType -_____________________[1]", this.dataType);
		console.log("dataContainerId -_____________________[1]", this.dataContainerId);
		console.log("dataStageName -_____________________[1]", this.dataStageName);
		console.log("dataContainerComponents -_____________________[1]", this.dataContainerComponents);

	}


	ngOnDestroy(): void {
		console.log('.');
	}

	public fileBrowseHandler(files: Event | any, x: any) {

		console.warn("[step 0.0 ] ->type and Selected Frame :");
		console.log(this.bannerType);
		console.log(this.dataContainerComponents.name);
		console.warn("[step 0 ] -> check what is in the selected banner  : ", this.dataInputValue)

		//this.uploadFilesSimulator(files.values);
		this.uploadFilesSimulator(files, x);
	}
	/**
	 * Simulate the upload process
	 */
	private uploadFilesSimulator(value: string, x: any) {

		for (let i = 0; i < this.dataInputValue.length; i++) {

			if (x === this.dataInputValue[i].id) { 
				this.dataInputValue[i].value = value; 
				console.warn("[step 1 ] -> Updated value is :") 
				console.warn(this.dataInputValue[i].value)
			}
		}
		const inDataInputValue: any[] = [];

		//Below i am creating an object with propeties to avoid hard coding 
		for (let outLoop = 0; outLoop < this.dataInputValue.length; outLoop++) {

			Object.defineProperty(inDataInputValue, this.dataInputValue[outLoop].nameId, { value: this.dataInputValue[outLoop].value })

		}
		console.warn("[step 3] -> Here object to send with updated value]");
		console.warn(inDataInputValue);

		//Below i am sending value to template.banner.component.dialog
		this.inputEvent.emit({
			value: inDataInputValue,
			stage: this.dataStageName,
			containerId: this.dataContainerId,
			type: this.dataType,
			componentName: this.componentName,
			frame : this.dataContainerComponents.name,
			bannerType : this.bannerType,

		});

	}










}
