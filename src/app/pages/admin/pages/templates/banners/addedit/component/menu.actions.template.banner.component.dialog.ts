
import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { DialogBannerComponentDuplicateComponent } from '@app/components';
import { Banner, Template } from '@app/core/models';
import { AlertService, ComponentService } from '@app/core/services';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
	selector: 'app-component-menu-actions',
	templateUrl: './menu.actions.template.banner.component.dialog.html',
	styleUrls: ['./menu.actions.template.banner.component.dialog.scss'],
})
export class TemplateBannerMenuActionDialogComponent implements OnInit, OnDestroy {

	// will use the _destroy$ observable to control
	// fetching items from an observable
	private _destroy$ = new Subject<boolean>();

	//public id!: string;
	//public isAddMode!: boolean;
	public loading = false;
	public submitted = false;

	//
	@Input() dataBanner!: Banner;
	@Input() dataTemplate!: Template;
	@Input() dataContainerId!: string;
	//wait for component to be emitted
	@Input() EditActiveComponentReceived!: any;

	// toggle edit canvas controls
	public activeComponentMenuActions: any;
	public editComponentDialogOpen = false;
	public componentDragandDropLock = true;
	private editableComponentsSubjectForDialog: BehaviorSubject<boolean>;
	public editableComponentsObsForDialog: Observable<boolean>;

	@Output() ComponentMenuActionscloseEvent = new EventEmitter<any>();
	@Output() ComponentUnlockEvent = new EventEmitter<any>();

	// component meta data form
	public FormGroupEditComponentMeta!: FormGroup;

	// component updates from canvas to form
	@Output() EditComponentEvent = new EventEmitter<any>();
	@Input() componentPositionUpdatesReceived!: any;
	// component updates from form
	//private updatedComponentFormDataSubject: BehaviorSubject<any>;
	//public updatedComponentFormDataObs: Observable<any>;

	// component delete
	@Output() DeleteComponentEvent = new EventEmitter<any>();

	//public FormGroupEditComponentMeta!: FormGroup;

	constructor(
		private elementRef: ElementRef,
		private dialog: MatDialog,
		private formBuilder: FormBuilder,
		private alertService: AlertService,
		private componentService: ComponentService
	) {

		//this.updatedComponentFormDataSubject = new BehaviorSubject<boolean>(false);
		//this.updatedComponentFormDataObs = this.updatedComponentFormDataSubject.asObservable();

		this.editableComponentsSubjectForDialog = new BehaviorSubject<boolean>(false);
		this.editableComponentsObsForDialog = this.editableComponentsSubjectForDialog.asObservable();
	}

	// convenience getter for easy access to form fields for editing components data
	get ftemplateeditcomponent() { return this.FormGroupEditComponentMeta.controls; }

	ngOnInit() {

		this.EditActiveComponentReceived.pipe(takeUntil(this._destroy$)).subscribe((evt: any) => {

			this.EditActiveComponentsMenuActions(evt);
		});

		this.componentPositionUpdatesReceived.pipe(takeUntil(this._destroy$)).subscribe((evt: any) => {

			////console.log('updated component position', evt);
		});

	}

	ngOnDestroy(): void {
		console.warn('Template Banner Component Menu Actions ngOnDestroy');
		this._destroy$.next(false);
		this._destroy$.complete();
	}

	public EditActiveComponentsMenuActions(event: any): void {

		if (!event) return;

		//console.warn('COMPONENT MENU ACTIONS:', event);

		this.elementRef.nativeElement.querySelector('.drag-drop-component-menu-actions').classList.add('active');

		this.activeComponentMenuActions = event;

		this.componentDragandDropLock = true;

		this.closeActiveComponentsEdit();

		//this.activeComponentMenuActions.isDeleting = false;
	}

	// component action menu triggers
	public closeActiveComponentsActionsMenu(): void {
		////console.log('Close Component Menu Actions');
		this.elementRef.nativeElement.querySelector('.drag-drop-component-menu-actions').classList.remove('active');
		this.ComponentMenuActionscloseEvent.emit(true);
	}

	// component edit dialog triggers
	public toggleEditComponentDialog(): void {
		this.editComponentDialogOpen = true;
		this.editableComponentsSubjectForDialog.next(this.activeComponentMenuActions);
	}

	public duplicateComponent(): void {

		//console.log('duplicate component:', this.activeComponentMenuActions, this.dataBanner);

		const duplicateDialog = this.dialog.open(DialogBannerComponentDuplicateComponent, {
			width: '400px',
			data: {
				title: 'Duplicate ' + this.activeComponentMenuActions.componenttype.name + '?',
				message: '',
				//container: container,
				dataTemplate: this.dataTemplate,
				dataComponent: this.activeComponentMenuActions,
				dataContainerId: this.dataContainerId,
				dataBanner: this.dataBanner
			}
		});
		duplicateDialog.afterClosed().subscribe(result => {

			////console.log('newComponent from dialog:', result);

			if (result !== undefined && result !== false) {

				//console.log('passContainer from dialog:', result);
				//this.alertService.success( component.name + ' added successfully.', { keepAfterRouteChange: false });
				//this.addComponent(result);

			} else {
				this.alertService.info('Duplication cancelled.', { keepAfterRouteChange: false });
			}
		});
	}

	public editComponentUpdatesFromForm(component: any) {

		//console.warn('Edit Dialog Component Updates:', component, this.activeComponentMenuActions );
		this.updateComponentMetaTemporary(component);

		this.EditComponentEvent.emit({
			stage: 'bannerCanvas-' + component.bannerWidth + '-' + component.bannerHeight,
			stages: 1,
			type: component.componenttypeName.toLowerCase(),
			component: component
		});
	}

	private updateComponentMetaTemporary(component: any): void {

		this.activeComponentMenuActions.smart = component.smart;

		for (const key in component.componentmeta) {
			if (Object.prototype.hasOwnProperty.call(component.componentmeta, key)) {
				const meta = component.componentmeta[key];
				const oldValue = this.activeComponentMenuActions.componentmeta.find((metaItem: any) => metaItem.name === key);
				if ([undefined, null].includes(oldValue)) {
					////console.log('NOT FOUND', key, oldValue, meta);
					//oldValue[key] = meta;
				} else {
					oldValue.value = meta;
				}
			}
		}
	}

	// component drag and drop
	public closeActiveComponentsEdit(): void {
		this.editComponentDialogOpen = false;
		this.editableComponentsSubjectForDialog.next(false);

		this.toggleComponentDragandDrop(true);
	}

	public activateComponentDragandDrop(): void {
		////console.log('deactivating/ activating component drag and drop');

		const DragandDropLockStatus = (this.componentDragandDropLock === true) ? false : true;

		this.toggleComponentDragandDrop(DragandDropLockStatus);

		if (DragandDropLockStatus === false) {
			this.toggleEditComponentDialog();
		} else {
			this.closeActiveComponentsEdit();
		}
	}

	private toggleComponentDragandDrop(status: boolean): void {

		this.componentDragandDropLock = status;
		this.ComponentUnlockEvent.emit({
			status: this.componentDragandDropLock,
			component: this.activeComponentMenuActions
		});
	}

	/** /
	public deleteActiveComponentsEdit():void {

		////console.log('deleteActiveComponentsEdit', this.EditActiveComponent, this.FormGroupEditComponentMeta.value);

		this.activeComponentMenuActions.isDeleting = true;

		const confirmDialog = this.dialog.open( DialogConfirmComponent, {
			data: {
				title: 'Confirm Delete Action',
				message: 'Are you sure you want to delete: ' + this.activeComponentMenuActions.name + '?.'
			}
		});
		confirmDialog.afterClosed().subscribe(result => {
			if (result === true) {

				this.deleteComponentPassEvent( this.activeComponentMenuActions );

			} else {
				console.info('Cancel Deleting ID:');

				this.activeComponentMenuActions.isDeleting = false;
			}
		});
	}
	/**/

	public deleteComponentPassEvent(component: any) {

		//console.warn('Delete Component:', component );

		this.closeActiveComponentsActionsMenu();

		this.DeleteComponentEvent.emit(component);

		this.activeComponentMenuActions.isDeleting = false;
	}

}
