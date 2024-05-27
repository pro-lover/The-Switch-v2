import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import { ForgotPasswordPage } from './pages/forgot-password/forgot-password.page';
import { PasswordResetPage } from './pages/password-reset/password-reset.page';
import { SignInPage } from './pages/sign-in/sign-in.page';
import { SignUpPage } from './pages/sign-up/sign-up.page';
import { VerifyEmailPage } from './pages/verify-email/verify-email.page';

const routes: Routes = [
	{
		path: ROUTER_UTILS.config.auth.signIn,
		component: SignInPage,
	},
	{
		path: ROUTER_UTILS.config.auth.signUp,
		component: SignUpPage,
	},
	{
		path: ROUTER_UTILS.config.auth.forgotPassword,
		component: ForgotPasswordPage,
	},
	/** /
	{
		path: ROUTER_UTILS.config.auth.forgotPasswordEmailSent,
		component: ForgotPasswordEmailSentPage,
	},
	/**/
	{
		path: ROUTER_UTILS.config.auth.passwordReset,
		component: PasswordResetPage,
	},
	/** /
	{
		path: ROUTER_UTILS.config.auth.passwordResetSucceeded,
		component: PasswordResetSucceededPage,
	},
	{
		path: ROUTER_UTILS.config.auth.passwordResetFailed,
		component: PasswordResetFailedPage,
	},
	/**/
	{
		path: ROUTER_UTILS.config.auth.verifyEmail,
		component: VerifyEmailPage,
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class AuthRoutingModule {}
