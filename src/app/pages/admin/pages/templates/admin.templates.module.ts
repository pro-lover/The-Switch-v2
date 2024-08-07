import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { BottomSheetTemplateRulesComponent } from '@app/components';
import { BannerModule } from '@app/components/banner/banner.module';
//import { AdminModule } from '@app/pages/admin/admin.module';
//import { BannerCreatorModule } from '@core/directimport {DragDropModule} from '@angular/cdk/drag-drop';ives/bannercreator/banner.creator.module';
import { CustomDragDropModule } from '@core/directives/drag-and-drop/dragdrop.module';
//import { TemplateBannerAddEditPage, TemplateBannersListPage, TemplatesAddEditComponent, TemplatesAddEditPage, TemplatesListPage } from './';
import { TemplateBannerAddEditPage, TemplateBannerAnimationEditDialogComponent, TemplateBannerEditDialogComponent, TemplateBannerMenuActionDialogComponent, TemplateBannersListPage, TemplatesAddEditPage, TemplatesListPage } from './';




@NgModule({
	declarations: [
		TemplatesListPage,
		TemplatesAddEditPage,
		//DragandDropComponent,
		//TemplatesAddEditComponent,
		TemplateBannersListPage,
		TemplateBannerAddEditPage,
		TemplateBannerEditDialogComponent,
		BottomSheetTemplateRulesComponent,
		TemplateBannerMenuActionDialogComponent,
		TemplateBannerAnimationEditDialogComponent,
	],
	imports: [
		//AdminModule,
		BannerModule,
		RouterModule,
		CommonModule,
		FormsModule,
		MatListModule,
		MatMenuModule,
		MatChipsModule,
		MatAutocompleteModule,
		MatSidenavModule,
		MatDividerModule,
		MatTooltipModule,
		//BannerCreatorModule,
		DragDropModule,
		CustomDragDropModule,
		ReactiveFormsModule,
		MatSnackBarModule,
		MatTabsModule,
		MatExpansionModule,
		MatStepperModule,
		MatDialogModule,
		MatSortModule,
		MatDatepickerModule,
		MatNativeDateModule,
		MatToolbarModule,
		MatTableModule,
		MatIconModule,
		MatPaginatorModule,
		MatButtonToggleModule,
		MatSlideToggleModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatCardModule,
		MatButtonModule,
		MatGridListModule,
		MatBottomSheetModule,
		MatProgressBarModule,
		MatProgressSpinnerModule
	],
	providers: [
		MatDatepickerModule,
		MatNativeDateModule
	]
})
export class AdminTemplatesModule {}
