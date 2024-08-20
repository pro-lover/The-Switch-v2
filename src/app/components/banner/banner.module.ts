import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CustomDragDropModule } from '@core/directives/drag-and-drop/dragdrop.module';
import { BannerComponent, BottomSheetBannerTemplateRulesComponent } from './banner.component';
import { BannerCreatorComponent } from './banner.creator.component';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatChipsModule} from '@angular/material/chips';
import {DragDropModule} from '@angular/cdk/drag-drop';

@NgModule({
	declarations: [BannerComponent, BottomSheetBannerTemplateRulesComponent, BannerCreatorComponent],
	imports: [CommonModule, CustomDragDropModule, MatProgressBarModule, MatPaginatorModule, MatBottomSheetModule, MatListModule,
				MatExpansionModule,MatIconModule,MatFormFieldModule,MatDatepickerModule,MatInputModule,FormsModule,
				ReactiveFormsModule,MatChipsModule,DragDropModule],
	exports: [BannerComponent, BannerCreatorComponent],
})
export class BannerModule {}
