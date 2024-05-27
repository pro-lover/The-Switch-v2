import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatListModule } from '@angular/material/list';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CustomDragDropModule } from '@core/directives/drag-and-drop/dragdrop.module';
import { BannerComponent, BottomSheetBannerTemplateRulesComponent } from './banner.component';
import { BannerCreatorComponent } from './banner.creator.component';

@NgModule({
	declarations: [BannerComponent, BottomSheetBannerTemplateRulesComponent, BannerCreatorComponent],
	imports: [CommonModule, CustomDragDropModule, MatProgressBarModule, MatPaginatorModule, MatBottomSheetModule, MatListModule],
	exports: [BannerComponent, BannerCreatorComponent],
})
export class BannerModule {}
