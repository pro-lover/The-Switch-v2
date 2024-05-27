import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import {
	HomePage, HowitworksPage
} from './pages';

const routes: Routes = [
	{
		path: ROUTER_UTILS.config.base.home,
		component: HomePage,
		data: {
			title: 'Home',
			description:
				'',
			robots: 'index, follow',
		},
	},
	{
		path: ROUTER_UTILS.config.base.howItWorks,
		component: HowitworksPage,
		data: {
			title: 'How it works',
			description:
				'How to use the platform',
			robots: 'index, follow',
		},
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class HomeRoutingModule {}
