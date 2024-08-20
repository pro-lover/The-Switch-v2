import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DragandDropComponent } from '@app/components/draganddrop/draganddrop.component';
import { DragAndDropDirective } from './dragdrop.directive';
import { InputTextComponent } from '@app/components/inputText/inputText.component';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import {MatDatepickerModule} from '@angular/material/datepicker';
import { MatListModule } from '@angular/material/list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
	declarations: [DragAndDropDirective, DragandDropComponent,InputTextComponent],
	imports: [CommonModule, MatPaginatorModule, MatProgressBarModule, MatListModule,
		MatExpansionModule,MatIconModule,MatFormFieldModule,MatDatepickerModule,MatInputModule,FormsModule,
		ReactiveFormsModule],
	exports: [DragAndDropDirective, DragandDropComponent,InputTextComponent],
})
export class CustomDragDropModule {}
