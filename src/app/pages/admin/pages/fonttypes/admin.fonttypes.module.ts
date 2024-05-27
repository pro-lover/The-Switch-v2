import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule } from '@angular/router';
import { DialogPreviewComponent, FontTypesAddEditPage, FontTypesListPage } from './';


@NgModule({
	declarations: [
		FontTypesListPage,
		FontTypesAddEditPage,
		DialogPreviewComponent
	],
	imports: [
		RouterModule,
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		MatAutocompleteModule,
		MatChipsModule,
		MatDialogModule,
		MatExpansionModule,
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
		MatProgressBarModule
	],
	providers: [
		MatDatepickerModule,
		MatNativeDateModule
	]
})
export class AdminFontTypesModule {}
