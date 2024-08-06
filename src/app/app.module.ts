import { NgModule } from '@angular/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AlertComponent } from '@app/components';
import { CoreModule } from '@core/core.module';
import { WebShellModule } from '@shell/web-shell.module';
import { AppComponent } from './app.component';
//import { TemplatesAddEditComponent } from './pages/admin/pages/templates/addedit/add.edit.component';

@NgModule({
	entryComponents: [
		//TemplatesAddEditComponent
	],
	declarations: [

		AppComponent,
		AlertComponent,
		//TemplatesAddEditComponent
	],
	imports: [
		BrowserModule,
		BrowserAnimationsModule,
		CoreModule,
		WebShellModule,
		MatSnackBarModule
	],
	exports: [
	],
	bootstrap: [
		AppComponent
	],
})
export class AppModule {}
