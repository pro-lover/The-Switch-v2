import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DragandDropComponent } from '@app/components/draganddrop/draganddrop.component';
import { DragAndDropDirective } from './dragdrop.directive';

@NgModule({
	declarations: [DragAndDropDirective, DragandDropComponent],
	imports: [CommonModule, MatPaginatorModule, MatProgressBarModule],
	exports: [DragAndDropDirective, DragandDropComponent],
})
export class CustomDragDropModule {}
