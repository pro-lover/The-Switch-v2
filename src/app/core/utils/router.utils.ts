export const ROUTER_UTILS = {
	config: {
		base: {
			home: '',
			faqs: 'faqs',
			howItWorks: 'how-it-works'
		},
		dashboard: {
			root: 'dashboard',
			jobs: 'jobs',
			notifications: 'notifications',
			downloads: 'downloads',
			reviews: 'reviews'
		},
		auth: {
			root: 'auth',
			signIn: 'login',
			signUp: 'register',
			verifyEmail: 'verify-email',
			forgotPassword: 'forgot-password',
			passwordReset: 'password-reset'
		},
		admin: {
			root: 'admin',
			accounts: {
				root: 'accounts',
				create: 'accounts/create',
				edit: 'accounts/edit/:id',
			},
			clients: {
				root: 'clients',
				create: 'clients/create',
				edit: 'clients/edit/:id',
			},
			projects: {
				root: 'projects',
				create: 'projects/create',
				edit: 'projects/edit/:id',
			},
			templates: {
				root: 'templates',
				create: 'templates/create',
				edit: 'templates/edit/:id',
				banners: {
					root: 'templates/edit/:id/banners',
					create: 'templates/edit/:id/banners/create',
					edit: 'templates/edit/:id/banners/edit/:bannerId',
				},
			},
			tasks: {
				root: 'tasks',
				create: 'tasks/create',
				edit: 'tasks/edit/:id',
			},
			data: {
				root: 'data',
				animations: {
					root: 'data/animations',
					create: 'data/animations/create',
					edit: 'data/animations/edit/:id',
				},
				animationTypes: {
					root: 'data/animation-types',
					create: 'data/animation-types/create',
					edit: 'data/animation-types/edit/:id',
				},
				bannerTypes: {
					root: 'data/banner-types',
					create: 'data/banner-types/create',
					edit: 'data/banner-types/edit/:id',
				},
				bannerSizes: {
					root: 'data/banner-sizes',
					create: 'data/banner-sizes/create',
					edit: 'data/banner-sizes/edit/:id',
				},
				components: {
					root: 'data/components',
					create: 'data/components/create',
					edit: 'data/components/edit/:id',
				},
				componentTypes: {
					root: 'data/component-types',
					create: 'data/component-types/create',
					edit: 'data/component-types/edit/:id',
				},
				easingTypes: {
					root: 'data/easing-types',
					create: 'data/easing-types/create',
					edit: 'data/easing-types/edit/:id',
				},
				eventTypes: {
					root: 'data/event-types',
					create: 'data/event-types/create',
					edit: 'data/event-types/edit/:id',
				},
				fontTypes: {
					root: 'data/font-types',
					create: 'data/font-types/create',
					edit: 'data/font-types/edit/:id',
				},
				taxonomies: {
					root: 'data/taxonomies',
					create: 'data/taxonomies/create',
					edit: 'data/taxonomies/edit/:id',
				},
				taskTypes: {
					root: 'data/task-types',
					create: 'data/task-types/create',
					edit: 'data/task-types/edit/:id',
				}
			}
		},
		settings: {
			root: 'settings',
			account: 'account',
			appearance: 'appearance',
			billing: 'billing',
			blockedUsers: 'blocked-users',
			notifications: 'notifications',
			security: 'security',
			securityLog: 'security-log'
		},
		user: {
			root: 'user',
			profile: {
				root: 'profile',
				//overview: 'overview',
				profile: 'username',
			},
			overview: {
				root: 'overview',
				overview: 'overview',

			},

		},
		errorResponse: {
			notFound: '404',
		},
	},
};
