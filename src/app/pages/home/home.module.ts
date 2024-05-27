import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
//import { DialogConfirmComponent, DialogRestoreComponent } from '@app/components';
//import { RouterModule } from '@angular/router';
import { HomeRoutingModule } from './home-routing.module';
import {
	HomePage, HowitworksPage
} from './pages';

@NgModule({
	declarations: [
		HomePage,
		HowitworksPage
		//DialogConfirmComponent,
		//DialogRestoreComponent
	],
	imports: [
		CommonModule,
		MatDialogModule,
		MatToolbarModule,
		MatCardModule,
		MatButtonModule,
		MatGridListModule,
		MatBottomSheetModule,
		MatProgressBarModule,
		HomeRoutingModule
	],
})
export class HomeModule {}
