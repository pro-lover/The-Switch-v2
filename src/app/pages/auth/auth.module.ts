import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { AuthRoutingModule } from './auth-routing.module';
import { ForgotPasswordPage } from './pages/forgot-password/forgot-password.page';
//import { PasswordResetFailedPage } from './pages/password-reset-failed/password-reset-failed.page';
//import { PasswordResetSucceededPage } from './pages/password-reset-succeeded/password-reset-succeeded.page';
import { PasswordResetPage } from './pages/password-reset/password-reset.page';
import { SignInPage } from './pages/sign-in/sign-in.page';
import { SignUpPage } from './pages/sign-up/sign-up.page';

@NgModule({
	declarations: [
		SignInPage,
		SignUpPage,
		ForgotPasswordPage,
		PasswordResetPage,
		//PasswordResetSucceededPage,
		//PasswordResetFailedPage,
	],
	imports: [
		CommonModule, AuthRoutingModule, FormsModule, ReactiveFormsModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatCardModule,
		MatButtonModule,
		MatGridListModule,
		MatBottomSheetModule,
		MatProgressBarModule
	],
})
export class AuthModule {}
