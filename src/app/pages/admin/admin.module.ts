import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
	DialogBannerComponentAddComponent,
	DialogBannerComponentDuplicateComponent,
	DialogBannerContainerAddComponent, DialogBannerContainerAnimationAddComponent, DialogBannerContainerEditComponent, DialogConfirmComponent,
	DialogRestoreComponent,
	DialogVersionControlComponent
} from '@app/components';
import { BannerModule } from '@app/components/banner/banner.module';
import { CustomDragDropModule } from '@core/directives/drag-and-drop/dragdrop.module';
import { AdminRoutingModule } from './admin-routing.module';
import {
	DialogBannerDuplicateComponent,
	DialogBannerEditComponent, TemplateBannerDuplicateDialogComponent, TemplatesAddAnimationFormDialogComponent,
	TemplatesAddContainerFormDialogComponent,
	TemplatesAddDialogComponent, TemplatesEditContainerFormDialogComponent
} from './pages/templates/banners';

@NgModule({
	/** /
	entryComponents: [
		TemplatesAddDialogComponent,
		DialogBannerContainerAddComponent,
		TemplatesAddContainerFormDialogComponent,
		DialogBannerContainerAnimationAddComponent
	],
	/**/
	declarations: [

		TemplatesAddDialogComponent,
		TemplateBannerDuplicateDialogComponent,
		DialogBannerEditComponent,
		DialogBannerDuplicateComponent,
		DialogConfirmComponent,
		DialogRestoreComponent,
		DialogVersionControlComponent,
		DialogBannerComponentAddComponent,
		DialogBannerComponentDuplicateComponent,
		DialogBannerContainerAddComponent,
		DialogBannerContainerEditComponent,
		TemplatesAddContainerFormDialogComponent,
		TemplatesEditContainerFormDialogComponent,
		TemplatesAddAnimationFormDialogComponent,
		DialogBannerContainerAnimationAddComponent
	],
	imports: [
		BannerModule,
		DragDropModule,
		CustomDragDropModule,
		CommonModule, AdminRoutingModule, FormsModule, ReactiveFormsModule,
		MatMenuModule,
		MatIconModule,
		MatStepperModule,
		MatChipsModule,
		MatAutocompleteModule,
		MatSlideToggleModule,
		MatSnackBarModule,
		MatTooltipModule,
		MatDialogModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatCardModule,
		MatButtonModule,
		MatGridListModule,
		MatBottomSheetModule,
		MatProgressBarModule
	],
})
export class AdminModule {}
