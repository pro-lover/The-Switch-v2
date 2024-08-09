import {
	Directive, ElementRef, EventEmitter, HostBinding, HostListener, Output
} from '@angular/core';


@Directive({
	selector: '[appDragDrop]',
})
export class DragAndDropDirective {

	//@HostBinding('attr.data-scope') contextScope!: string;
	@HostBinding('class.fileover') fileOver: boolean | undefined;
	@Output() fileDropped = new EventEmitter<any>();

	constructor(private elementRef: ElementRef) {
		////console.log('Drag and Drop Scope: ', this.contextScope);
	}

	// Dragover listener
	@HostListener('dragover', ['$event']) onDragOver(evt: any) {
		evt.preventDefault();
		evt.stopPropagation();
		this.fileOver = true;
	}

	// Dragleave listener
	@HostListener('dragleave', ['$event']) public onDragLeave(evt: any) {
		evt.preventDefault();
		evt.stopPropagation();
		this.fileOver = false;
	}

	// Drop listener
	@HostListener('drop', ['$event']) public ondrop(evt: any) {
		evt.preventDefault();
		evt.stopPropagation();
		this.fileOver = false;
		const files = evt.dataTransfer.files;

		if (files.length > 0) {
			this.fileDropped.emit(files);
		}


	}
	@HostListener('change', ['$event.target']) onChange(evt: any) {
		evt.preventDefault();
		evt.stopPropagation();
	}
}
