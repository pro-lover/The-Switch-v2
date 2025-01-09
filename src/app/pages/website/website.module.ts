import { DragDropModule } from '@angular/cdk/drag-drop';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BannerModule } from '@app/components/banner/banner.module';
import { CustomDragDropModule } from '@core/directives/drag-and-drop/dragdrop.module';
import { WebsiteRoutingModule } from './website-routing.module';
import {MatDividerModule} from '@angular/material/divider';
import { WebsitePage, DialogEditVariationFormComponent, TemplateBannerVariationsDialogComponent } from './pages';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatMenuModule} from '@angular/material/menu';
@NgModule({
	declarations: [
		WebsitePage,
		TemplateBannerVariationsDialogComponent,
		//DragandDropComponent
		DialogEditVariationFormComponent
	],
	imports: [
		MatMenuModule,
		MatProgressSpinnerModule,
		MatDividerModule,
		MatGridListModule,
		OverlayModule,
		MatTooltipModule,
		DragDropModule,
		MatCardModule,
		MatSidenavModule,
		MatButtonToggleModule,
		MatBottomSheetModule,
		MatToolbarModule,
		MatIconModule,
		MatPaginatorModule,
		MatRadioModule,
		MatCheckboxModule,
		MatButtonModule,
		MatSelectModule,
		MatInputModule,
		MatFormFieldModule,
		FormsModule,
		ReactiveFormsModule,
		CommonModule,
		BannerModule,
		CustomDragDropModule,
		MatDialogModule,
		MatExpansionModule,
		MatSnackBarModule,
		MatStepperModule,
		MatProgressBarModule,
		WebsiteRoutingModule
	]
})
export class WebsiteModule {}
