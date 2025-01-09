import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import {
	WebsitePage
} from './pages';

const routes: Routes = [
	{
		path: ROUTER_UTILS.config.website.root,
		component: WebsitePage,
		data: {
			title: 'Home',
			description:
				'Generate Creative Variations',
			robots: 'index, follow',
		},
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class WebsiteRoutingModule {}
