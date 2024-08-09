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
	@Input() dataInputValue!: string;
	@Input() dataStageName!: string;
	@Input() dataType!: string;
	@Input() componentName!: string;
	@Input() dataContainerId!: number | string;
	logs: string[] = [];

	constructor(

	) {

	}

	ngOnInit() {
		console.log("InputTextComponent________________________________________________________________[1]");


	}


	ngOnDestroy(): void {
		console.log('________[input]________ ngOnDestroy');
	}

	public fileBrowseHandler(files: Event | any) {
		this.logs.push('ngDoCheck  look i am working');
		console.log("InputTextComponent________________________________________________________________[4]");
		this.uploadFilesSimulator(files.values);
		this.uploadFilesSimulator(files);
	}
	/**
	 * Simulate the upload process
	 */
	private uploadFilesSimulator(value: string) {

		console.log("________________________________________________________________[6]", value);

		this.inputEvent.emit({
			value: { text: value },
			stage: this.dataStageName,
			containerId: this.dataContainerId,
			type: this.dataType,
			componentName: this.componentName,

		});

	}










}
