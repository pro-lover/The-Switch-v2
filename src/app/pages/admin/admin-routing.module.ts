import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Role } from '@app/core/models';
import { RoleGuard } from '@core/guards';
import { ROUTER_UTILS } from '@core/utils/router.utils';
import {
	AccountsAddEditPage,
	AccountsListPage,
	AnimationsAddEditPage,
	AnimationsListPage,
	AnimationTypesAddEditPage,
	AnimationTypesListPage,
	BannerSizesAddEditPage,
	BannerSizesListPage,
	BannerTypesAddEditPage,
	BannerTypesListPage,
	ClientsAddEditPage,
	ClientsListPage,
	ComponentsAddEditPage,
	ComponentsListPage,
	ComponentTypesAddEditPage,
	ComponentTypesListPage,
	EasingTypesAddEditPage,
	EasingTypesListPage,
	EventTypesAddEditPage,
	EventTypesListPage,
	FontTypesAddEditPage,
	FontTypesListPage,
	ProjectsAddEditPage,
	ProjectsListPage,
	TasksAddEditPage,
	TasksListPage,
	TaxonomiesAddEditPage,
	TaxonomiesListPage,
	TemplateBannerAddEditPage,
	TemplateBannersListPage,
	TemplatesAddEditPage,
	TemplatesListPage
} from './pages';

const AdminAccountsModule = () => import('./pages/accounts/admin.accounts.module').then(x => x.AdminAccountsModule);
const AdminClientsModule = () => import('./pages/clients/admin.clients.module').then(x => x.AdminClientsModule);
const AdminAnimationsModule = () => import('./pages/animations/admin.animations.module').then(x => x.AdminAnimationsModule);
const AdminTaxonomiesModule = () => import('./pages/taxonomies/admin.taxonomies.module').then(x => x.AdminTaxonomiesModule);
const AdminAnimationTypesModule = () => import('./pages/animationtypes/admin.animationtypes.module').then(x => x.AdminAnimationTypesModule);
const AdminBannerSizesModule = () => import('./pages/bannersizes/admin.bannersizes.module').then(x => x.AdminBannerSizesModule);
const AdminBannerTypesModule = () => import('./pages/bannertypes/admin.bannertypes.module').then(x => x.AdminBannerTypesModule);
const AdminComponentsModule = () => import('./pages/components/admin.components.module').then(x => x.AdminComponentsModule);
const AdminComponentTypesModule = () => import('./pages/componenttypes/admin.componenttypes.module').then(x => x.AdminComponentTypesModule);
const AdminEasingTypesModule = () => import('./pages/easingtypes/admin.easingtypes.module').then(x => x.AdminEasingTypesModule);
const AdminEventTypesModule = () => import('./pages/eventtypes/admin.eventtypes.module').then(x => x.AdminEventTypesModule);
const AdminFontTypesModule = () => import('./pages/fonttypes/admin.fonttypes.module').then(x => x.AdminFontTypesModule);
const AdminProjectsModule = () => import('./pages/projects/admin.projects.module').then(x => x.AdminProjectsModule);
const AdminTasksModule = () => import('./pages/tasks/admin.tasks.module').then(x => x.AdminTasksModule);
const AdminTemplatesModule = () => import('./pages/templates/admin.templates.module').then(x => x.AdminTemplatesModule);

const AllRoles = [Role.User, Role.Client, Role.Designer, Role.Developer, Role.ProjectLeader, Role.QualityAssurance, Role.Admin];

const routes: Routes = [
	{
		path: ROUTER_UTILS.config.admin.accounts.root,
		component: AccountsListPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Accounts',
			roles: [Role.Admin]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.accounts.create,
		component: AccountsAddEditPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Add Account',
			roles: [Role.Admin]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.accounts.edit,
		component: AccountsAddEditPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Edit Account',
			roles: AllRoles
		}
	},
	/** BETTER APPROACH FOR ASYNC LOADING /
	{
		path: ROUTER_UTILS.config.admin.accounts.create,
		loadChildren: AdminAccountsModule
	},
	{
		path: ROUTER_UTILS.config.admin.accounts.edit,
		loadChildren: AdminAccountsModule
	},
	/**/
	{
		path: ROUTER_UTILS.config.admin.clients.root,
		component: ClientsListPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Clients',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.clients.create,
		component: ClientsAddEditPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Add Client',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.clients.edit,
		component: ClientsAddEditPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Edit Client',
			roles: [Role.Admin, Role.Client, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.projects.root,
		component: ProjectsListPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Projects',
			roles: [Role.Admin, Role.Designer, Role.Developer, Role.ProjectLeader]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.projects.create,
		component: ProjectsAddEditPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Add Project',
			roles: [Role.Admin, Role.Designer, Role.Developer, Role.ProjectLeader]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.projects.edit,
		component: ProjectsAddEditPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Edit Project',
			roles: [Role.Admin, Role.Designer, Role.Developer, Role.ProjectLeader]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.templates.root,
		component: TemplatesListPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Templates',
			roles: [Role.Admin, Role.Designer, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.templates.create,
		component: TemplatesAddEditPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Add Template',
			roles: [Role.Admin, Role.Designer, Role.Developer]
		},
		loadChildren: AdminTemplatesModule
	},
	{
		path: ROUTER_UTILS.config.admin.templates.edit,
		component: TemplatesAddEditPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Edit Template',
			roles: [Role.Admin, Role.Designer, Role.Developer]
		},
		loadChildren: AdminTemplatesModule
	},
	{
		path: ROUTER_UTILS.config.admin.templates.banners.root,
		component: TemplateBannersListPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Manage Template Banners',
			roles: [Role.Admin, Role.Designer, Role.Developer]
		},
		loadChildren: AdminTemplatesModule
	},
	{
		path: ROUTER_UTILS.config.admin.templates.banners.edit,
		component: TemplateBannerAddEditPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Edit Template Banner',
			roles: [Role.Admin, Role.Designer, Role.Developer]
		},
		loadChildren: AdminTemplatesModule
	},
	{
		path: ROUTER_UTILS.config.admin.tasks.root,
		component: TasksListPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Tasks',
			roles: [Role.Admin, Role.Designer, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.tasks.create,
		component: TasksAddEditPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Add Task',
			roles: [Role.Admin, Role.Designer, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.tasks.edit,
		component: TasksAddEditPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Edit Task',
			roles: [Role.Admin, Role.Designer, Role.Developer]
		}
	},
	// LOOKUP FIELDS
	{
		path: ROUTER_UTILS.config.admin.data.animations.root,
		component: AnimationsListPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Animations',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.data.animations.create,
		component: AnimationsAddEditPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Add Animation',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.data.animations.edit,
		component: AnimationsAddEditPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Edit Animation',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.data.animationTypes.root,
		component: AnimationTypesListPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Animation Types',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.data.animationTypes.create,
		component: AnimationTypesAddEditPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Add Animation Type',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.data.animationTypes.edit,
		component: AnimationTypesAddEditPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Edit Animation Type',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.data.bannerTypes.root,
		component: BannerTypesListPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Banner Types',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.data.bannerTypes.create,
		component: BannerTypesAddEditPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Add Banner Type',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.data.bannerTypes.edit,
		component: BannerTypesAddEditPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Edit Banner Type',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.data.bannerSizes.root,
		component: BannerSizesListPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Banner Sizes',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.data.bannerSizes.create,
		component: BannerSizesAddEditPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Add Banner Size',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.data.bannerSizes.edit,
		component: BannerSizesAddEditPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Edit Banner Size',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.data.components.root,
		canActivate: [RoleGuard],
		component: ComponentsListPage,
		data: {
			breadcrumb: 'Components',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.data.components.create,
		canActivate: [RoleGuard],
		component: ComponentsAddEditPage,
		data: {
			breadcrumb: 'Add Component',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.data.components.edit,
		canActivate: [RoleGuard],
		component: ComponentsAddEditPage,
		data: {
			breadcrumb: 'Edit Component',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.data.componentTypes.root,
		canActivate: [RoleGuard],
		component: ComponentTypesListPage,
		data: {
			breadcrumb: 'Component Types',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.data.componentTypes.create,
		canActivate: [RoleGuard],
		component: ComponentTypesAddEditPage,
		data: {
			breadcrumb: 'Add Component Type',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.data.componentTypes.edit,
		canActivate: [RoleGuard],
		component: ComponentTypesAddEditPage,
		data: {
			breadcrumb: 'Edit Component Type',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.data.easingTypes.root,
		component: EasingTypesListPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Easing Types',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.data.easingTypes.create,
		component: EasingTypesAddEditPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Add Easing Type',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.data.easingTypes.edit,
		component: EasingTypesAddEditPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Edit Easing Type',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.data.eventTypes.root,
		component: EventTypesListPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Event Types',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.data.eventTypes.create,
		component: EventTypesAddEditPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Add Event Type',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.data.eventTypes.edit,
		component: EventTypesAddEditPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Edit Event Type',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.data.fontTypes.root,
		component: FontTypesListPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'FontTypes',
			roles: [Role.Admin, Role.Developer, Role.Designer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.data.fontTypes.create,
		component: FontTypesAddEditPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Add FontType',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.data.fontTypes.edit,
		component: FontTypesAddEditPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Edit FontType',
			roles: [Role.Admin, Role.Developer]
		}
	},	{
		path: ROUTER_UTILS.config.admin.data.taxonomies.root,
		component: TaxonomiesListPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Taxonomies',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.data.taxonomies.create,
		component: TaxonomiesAddEditPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Add Taxonomy',
			roles: [Role.Admin, Role.Developer]
		}
	},
	{
		path: ROUTER_UTILS.config.admin.data.taxonomies.edit,
		component: TaxonomiesAddEditPage,
		canActivate: [RoleGuard],
		data: {
			breadcrumb: 'Edit Taxonomy',
			roles: [Role.Admin, Role.Developer]
		}
	},
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule],
})
export class AdminRoutingModule {}
