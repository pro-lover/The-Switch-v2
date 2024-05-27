import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClientXsrfModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { appInitializer } from '@app/bootstrap';
import { AccountService } from '@app/core/services';
import { ErrorInterceptor, JwtInterceptor, XsrfInterceptor } from '@app/shared/interceptors';

@NgModule({
	declarations: [],
	imports: [
		CommonModule,
		HttpClientModule,
		HttpClientXsrfModule.withOptions({
			cookieName: 'XSRF-TOKEN',
			headerName: 'X-XSRF-TOKEN'
		})
	],
	providers: [
		{
			provide: APP_INITIALIZER,
			useFactory: appInitializer,
			multi: true,
			deps: [AccountService]
		},
		{ provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
		{ provide: HTTP_INTERCEPTORS, useClass: XsrfInterceptor, multi: true },
		{ provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
	],
})
export class CoreModule {}
