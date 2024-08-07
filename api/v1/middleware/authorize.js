const path = require('path');
const jwt = require('express-jwt');

const { secret } = require(path.join(__dirname, '../config.json'));
const db = require(path.join(__dirname, '../shared/db'));

module.exports = authorize;

function authorize(roles = []) {
	// roles param can be a single role string (e.g. Role.User or 'User')
	// or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
	if (typeof roles === 'string') {
		roles = [roles];
	}

	return [
		// authenticate JWT token and attach user to request object (req.user)
		jwt({ secret, algorithms: ['HS256'] }),

		// authorize based on user role
		async (req, res, next) => {
			const account = await db.Account.findByPk(req.user.id);

			if (!account || (roles.length && !roles.includes(account.role))) {
				// account no longer exists or role not authorized
				////console.log('WTF: ', account.role, roles);
				return res.status(401).json({ message: 'Unauthorized' });
			}

			// authentication and authorization successful
			req.user.id = account.id;
			req.user.role = account.role;
			const refreshTokens = await account.getRefreshTokens();
			req.user.ownsToken = token => !!refreshTokens.find(x => x.token === token);
			next();
		}
	];
}
