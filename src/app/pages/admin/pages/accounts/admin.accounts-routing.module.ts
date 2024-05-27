import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import {
	AccountsAddEditPage
} from './';


const routes: Routes = [
	{
		path: '',
		component: AccountsAddEditPage,
		data: {
			breadcrumb: 'Add Account'
		}
	},
	{
		path: ROUTER_UTILS.config.admin.accounts.edit,
		component: AccountsAddEditPage,
		data: {
			breadcrumb: 'Edit Account'
		}
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class AdminAccountsRoutingModule {}
