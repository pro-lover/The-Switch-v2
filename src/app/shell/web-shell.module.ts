import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard, NoAuthGuard } from '@core/guards';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import { FooterModule } from '@shell/ui/footer/footer.module';
import { HeaderModule } from '@shell/ui/header/header.module';
import { LayoutModule } from '@shell/ui/layout/layout.module';
import { NotFoundModule } from '@shell/ui/not-found/not-found.module';
import { NotFoundPage } from '@shell/ui/not-found/not-found.page';

const APP_ROUTES: Routes = [
	{
		path: ROUTER_UTILS.config.auth.root,
		loadChildren: async () =>
		(await import('@pages/auth/auth.module')).AuthModule,
		canLoad: [NoAuthGuard],
	},
	{
		path: ROUTER_UTILS.config.admin.root,
		loadChildren: async () =>
		(await import('@pages/admin/admin.module')).AdminModule,
		canLoad: [AuthGuard],
	},
	{
		path: ROUTER_UTILS.config.base.home,
		loadChildren: async () =>
		(await import('@pages/home/home.module')).HomeModule,
		canLoad: [AuthGuard],
	},
	{
		path: ROUTER_UTILS.config.base.home,
		loadChildren: async () =>
		(await import('@pages/dashboard/dashboard.module')).DashboardModule,
		canLoad: [AuthGuard],
	},
	{
		path: ROUTER_UTILS.config.base.home,
		loadChildren: async () =>
		(await import('@pages/website/website.module')).WebsiteModule,
		canLoad: [AuthGuard],
	},
	{
		path: ROUTER_UTILS.config.settings.root,
		loadChildren: async () =>
		(await import('@pages/settings/settings.module')).SettingsModule,
		canLoad: [AuthGuard],
	},
	{
		path: ROUTER_UTILS.config.user.root,
		loadChildren: async () =>
		(await import('@pages/user/user.module')).UserModule,
		canLoad: [AuthGuard],
	},
	{
		path: '**',
		loadChildren: async () =>
		(await import('@shell/ui/not-found/not-found.module')).NotFoundModule,
		component: NotFoundPage,
	},
];

@NgModule({
	imports: [
		CommonModule,
		RouterModule.forRoot(APP_ROUTES),
		FooterModule,
		HeaderModule,
		LayoutModule,
		NotFoundModule,
	],
	exports: [
		RouterModule,
		FooterModule,
		HeaderModule,
		LayoutModule,
		NotFoundModule,
	],
})
export class WebShellModule {}
