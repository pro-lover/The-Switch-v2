const express = require('express');
const router = express.Router();
const Joi = require('joi');
const path = require('path');
const rateLimit = require("express-rate-limit");
const preciseMemory = require("precise-memory-rate-limit/lib");
const logger = require('node-color-log');

const validateRequest = require(path.join(__dirname, '../middleware/validate-request'));
const authorize = require(path.join(__dirname, '../middleware/authorize'));
const Role = require(path.join(__dirname, '../shared/role'));
const accountService = require(path.join(__dirname, '../services/account.service'));

const limiter = rateLimit({
	store: new preciseMemory(15 * 60 * 1000, 15),
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 15 // limit each IP to 5 requests per windowMs
});

// routes
router.post('/authenticate', limiter, authenticateSchema, authenticate);
router.post('/refresh-token', refreshToken );
router.post('/revoke-token', limiter, authorize(), revokeTokenSchema, revokeToken);
router.post('/register', limiter, registerSchema, register);
router.post('/verify-email', limiter, verifyEmailSchema, verifyEmail);
router.post('/forgot-password', limiter, forgotPasswordSchema, forgotPassword);
router.post('/validate-reset-token', limiter, validateResetTokenSchema, validateResetToken);
router.post('/reset-password', limiter, resetPasswordSchema, resetPassword);

router.post('/recaptcha-verify', verifyRecaptchaSchema, recaptchaVerify);
//
router.post('/request-role', verifyRequestRoleEmailSchema, requestRoleEmail);
//
router.get('/', authorize(Role.Admin), getAll);
router.get('/:id', authorize(), getById);
router.post('/', authorize(Role.Admin), createSchema, create);
router.put('/:id/restore', authorize([Role.Admin]), restore);
router.put('/:id/update-status', authorize(Role.Admin), updateStatusSchema, updateStatus);
router.put('/:id', authorize(), updateSchema, update);

router.delete('/:id', authorize(), _delete);

module.exports = router;

function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function authenticate(req, res, next) {
    const { email, password } = req.body;
    const ipAddress = req.ip;
    accountService.authenticate({ email, password, ipAddress })
        .then(({ refreshToken, ...account }) => {
            setTokenCookie(res, refreshToken);
            res.json(account);
        })
        .catch(next);
}

function refreshToken(req, res, next) {
    const token = req.cookies.refreshToken;
    const ipAddress = req.ip;

	//res.header("Access-Control-Allow-Origin", "*");
	//res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

	//logger.color('green').bold().log( 'XSRF-TOKEN(refreshToken):', req.csrfToken() );

	//res.cookie('XSRF-TOKEN', req.csrfToken());
	//res.cookie('XSRF-TOKEN', req.csrfToken(), { httpOnly: true });
	//res.cookie('XSRF-TOKEN', req.csrfToken(), { httpOnly: false });

	//res.cookie('XSRF_TOKEN', req.csrfToken(), { httpOnly: true });

    accountService.refreshToken({ token, ipAddress })
        .then(({ refreshToken, ...account }) => {
            setTokenCookie(res, refreshToken);
            res.json(account);
        })
        .catch(next);
}

function revokeTokenSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().empty('')
    });
    validateRequest(req, next, schema);
}

function revokeToken(req, res, next) {
    // accept token from request body or cookie
    const token = req.body.token || req.cookies.refreshToken;
    const ipAddress = req.ip;

    if (!token) return res.status(400).json({ message: 'Token is required' });

    // users can revoke their own tokens and admins can revoke any tokens
    if (!req.user.ownsToken(token) && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    accountService.revokeToken({ token, ipAddress })
        .then(() => res.json({ message: 'Token revoked' }))
        .catch(next);
}

function registerSchema(req, res, next) {
    const schema = Joi.object({
        title: Joi.string().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
        acceptTerms: Joi.boolean().valid(true).required()
    });
    validateRequest(req, next, schema);
}

function register(req, res, next) {
    accountService.register(req.body, req.get('origin'))
        .then(() => res.json({ message: 'Registration successful, please check your email for verification instructions' }))
        .catch(next);
}

function verifyRecaptchaSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().required(),
		secret: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function recaptchaVerify(req, res, next) {
	accountService.verifyRecaptchaToken(req.body)
		.then((obj) => {
			//console.log('obj:', obj.data);
			if( obj.data.success === false ) {
				//res.json({ message: 'Recaptcha Verification Unsuccessful.' });
				next();
			} else {
				res.json({ message: 'Recaptcha Verification successful.' });
			}

		})
		.catch(next);
}

function verifyEmailSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function verifyEmail(req, res, next) {
	accountService.verifyEmail(req.body)
		.then(() => res.json({ message: 'Verification successful, you can now login' }))
		.catch(next);
}

function verifyRequestRoleEmailSchema(req, res, next) {
	const schema = Joi.object({
		role: Joi.string().required(),
		account: Joi.object().required()
	});
	validateRequest(req, next, schema);
}

function requestRoleEmail(req, res, next) {
	accountService.requestRole(req.body)
		.then(() => res.json({ message: 'Request sent successfully for updating user role.' }))
		.catch(next);
}

function forgotPasswordSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().email().required()
    });
    validateRequest(req, next, schema);
}

function forgotPassword(req, res, next) {
    accountService.forgotPassword(req.body, req.get('origin'))
        .then(() => res.json({ message: 'Please check your email for password reset instructions' }))
        .catch(next);
}

function validateResetTokenSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().required()
    });
    validateRequest(req, next, schema);
}

function validateResetToken(req, res, next) {
    accountService.validateResetToken(req.body)
        .then(() => res.json({ message: 'Token is valid' }))
        .catch(next);
}

function resetPasswordSchema(req, res, next) {
    const schema = Joi.object({
        token: Joi.string().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    });
    validateRequest(req, next, schema);
}

function resetPassword(req, res, next) {
    accountService.resetPassword(req.body)
        .then(() => res.json({ message: 'Password reset successful, you can now login' }))
        .catch(next);
}

function getAll(req, res, next) {
    accountService.getAll()
        .then(accounts => res.json(accounts))
        .catch(next);
}

function getById(req, res, next) {
    // users can get their own account and admins can get any account
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    accountService.getById(req.params.id)
        .then(account => account ? res.json(account) : res.sendStatus(404))
        .catch(next);
}

function createSchema(req, res, next) {
    const schema = Joi.object({
        title: Joi.string().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).required(),
        confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
        role: Joi.string().valid(Role.Admin, Role.User, Role.ProjectLeader, Role.Designer, Role.Developer).required()
    });
    validateRequest(req, next, schema);
}

function create(req, res, next) {
    accountService.create(req.body)
        .then(account => res.json(account))
        .catch(next);
}

function updateSchema(req, res, next) {
    const schemaRules = {
        title: Joi.string().required(),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
		role: Joi.string().empty(''),
        email: Joi.string().email().required(),
        password: Joi.string().min(6).empty(''),
        confirmPassword: Joi.string().valid(Joi.ref('password')).empty(''),
		accountId: Joi.number().required(),
		//researcherId: Joi.number().empty('')
    };

    // only admins can update role
    if (req.user.role === Role.Admin) {
        schemaRules.role = Joi.string().valid(
			Role.Admin,
			Role.User,
			Role.Client,
			Role.Designer,
			Role.Developer,
			Role.ProjectLeader,
			Role.QualityAssurance
		).empty('');
    }

    const schema = Joi.object(schemaRules).with('password', 'confirmPassword');
    validateRequest(req, next, schema);
}

function update(req, res, next) {
	// admins can update any account
	if ( Number(req.params.id) && (req.user.role == Role.Admin) ) {
		accountService.update(req.params.id, req.body, req.user.id)
			.then(account => res.json(account))
			.catch(next);

	// users can only update their own account
	} else if ( Number(req.params.id) === Number(req.user.id) ) {

		accountService.update(req.params.id, req.body, req.user.id)
			.then(account => res.json(account))
			.catch(next);

	} else {
		//console.log('Failed!', req.params.id, req.user.id);

		return res.status(401).json({ message: 'Unauthorized' });
	}

}

function updateStatusSchema(req, res, next) {
	const schemaRules = Joi.object({
		status: Joi.boolean().required()
	});
	validateRequest(req, next, schemaRules);
}

function updateStatus(req, res, next) {
	if ( Number(req.params.id) && (req.user.role == Role.Admin) ) {
		accountService.updateStatus(req.params.id, req.body, req.user.id)
			.then(account => res.json(account))
			.catch(next);
	} else {
		return res.status(401).json({ message: 'Unauthorized' });
	}
}

function _delete(req, res, next) {
    // admins can delete any account
    if (Number(req.params.id) !== req.user.id && req.user.role !== Role.Admin) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    accountService.delete(req.params.id, req.user.id)
        .then(() => res.json({ message: 'Account deleted successfully' }))
        .catch(next);
}

function restore(req, res, next) {

	if ( Number(req.params.id) && req.user.role !== Role.Admin) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	accountService.restore(req.params.id, req.user.id)
		.then(() => res.json({ message: 'Account restored successfully' }))
		.catch(next);
}
// helper functions

function setTokenCookie(res, token) {
    // create cookie with refresh token that expires in 7 days
    const cookieOptions = {
        httpOnly: true,
		secure: true,
        expires: new Date(Date.now() + 7*24*60*60*1000)
    };
    res.cookie('refreshToken', token, cookieOptions);
}
