import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DragandDropComponent } from '@app/components/draganddrop/draganddrop.component';
import { DragAndDropDirective } from './dragdrop.directive';
import { InputTextComponent } from '@app/components/inputText/inputText.component'


@NgModule({
	declarations: [DragAndDropDirective, DragandDropComponent,InputTextComponent],
	imports: [CommonModule, MatPaginatorModule, MatProgressBarModule],
	exports: [DragAndDropDirective, DragandDropComponent,InputTextComponent],
})
export class CustomDragDropModule {}
