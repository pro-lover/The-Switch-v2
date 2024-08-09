const path = require('path');
const config = require(path.join(__dirname, '../config.json'));

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const { Op } = require('sequelize');
const axios = require('axios');

const bcryptSaltRounds = bcrypt.genSaltSync(10);

const sendEmail = require(path.join(__dirname, '../shared/send-email'));
const db = require(path.join(__dirname, '../shared/db'));
const Role = require(path.join(__dirname, '../shared/role'));

module.exports = {
    authenticate,
    refreshToken,
    revokeToken,
    register,
	verifyRecaptchaToken,
    verifyEmail,
	requestRole,
	requestProjectleader,
    forgotPassword,
    validateResetToken,
    resetPassword,
    getAll,
    getById,
    create,
    update,
	updateStatus,
	restore,
    delete: _delete
};

async function authenticate({ email, password, ipAddress }) {
    const account = await db.Account.scope('withHash').findOne({
		where: { email }
	});

    if (!account || !account.isVerified || !(await bcrypt.compare(password, account.passwordHash))) {
        throw 'Email or password is incorrect';
    }

    // authentication successful so generate jwt and refresh tokens
    const jwtToken = generateJwtToken(account);
    const refreshToken = generateRefreshToken(account, ipAddress);

    // save refresh token
    await refreshToken.save();

    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: refreshToken.token
    };
}

async function refreshToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);
    const account = await refreshToken.getAccount({

	});

    // replace old refresh token with a new one and save
    const newRefreshToken = generateRefreshToken(account, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByToken = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    // generate new jwt
    const jwtToken = generateJwtToken(account);

    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
        refreshToken: newRefreshToken.token
    };
}

async function revokeToken({ token, ipAddress }) {
    const refreshToken = await getRefreshToken(token);

    // revoke token and save
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();
}

async function register(params, origin) {
    // validate
    if (await db.Account.findOne({ where: { email: params.email } })) {
        // send already registered error in email to prevent account enumeration
        return await sendAlreadyRegisteredEmail(params.email, origin);
    }

    // create account object
    const account = new db.Account(params);

    // first registered account is an admin
    const isFirstAccount = (await db.Account.count()) === 0;
    account.role = isFirstAccount ? Role.Admin : Role.User;
    account.verificationToken = randomTokenString();

    // hash password
    account.passwordHash = await hash(params.password);

    // save account
    await account.save();

    // send email
    await sendVerificationEmail(account, origin);
}

async function verifyRecaptchaToken({ token, secret }) {

    if (!token) throw 'Verification failed';

	return await axios({
		method: 'post',
		url: 'https://www.google.com/recaptcha/api/siteverify',
		params: {
			response: token,
			secret: secret
		}
	});

	////console.log(response.data);


	/** /
	  .then(function (response) {
		//console.log(response);
	  })
	  .catch(function (error) {
		//console.log(error);
	  });
	/**/

}

async function verifyEmail({ token }) {
    const account = await db.Account.findOne({ where: { verificationToken: token } });

    if (!account) throw 'Verification failed';

    account.verified = Date.now();
    account.verificationToken = null;
    await account.save();
}

async function forgotPassword({ email }, origin) {
    const account = await db.Account.findOne({ where: { email } });

    // always return ok response to prevent email enumeration
    if (!account) return;

    // create reset token that expires after 24 hours
    account.resetToken = randomTokenString();
    account.resetTokenExpires = new Date(Date.now() + 24*60*60*1000);
    await account.save();

    // send email
    await sendPasswordResetEmail(account, origin);
}

async function validateResetToken({ token }) {
    const account = await db.Account.findOne({
        where: {
            resetToken: token,
            resetTokenExpires: { [Op.gt]: Date.now() }
        }
    });

    if (!account) throw 'Invalid token';

    return account;
}

async function resetPassword({ token, password }) {
    const account = await validateResetToken({ token });

    // update password and remove reset token
    account.passwordHash = await hash(password);
    account.passwordReset = Date.now();
    account.resetToken = null;
    await account.save();
}

async function requestRole({ account, role }, origin) {

	// send email
	await sendRequestRole( account, role, origin);
}

async function requestProjectleader({ account, projects }, origin) {

	// send email
	await sendRequestProjectleader( account, projects, origin);
}

async function getAll() {

	const allHistories = await getHistory();
    const accounts = await db.Account.findAll({
		paranoid: false,
		order: [
			['lastName', 'ASC']
		]
	});

	if( allHistories.length > 0 ) {

		accounts.forEach( function(prime) {
			prime.history = allHistories.filter( function (sub) {
				return sub.id === prime.id;
			});
		});

	} else {
		accounts.forEach( function(prime) {
			prime.history = [];
		});
	}

	//return accounts;
	return accounts.map(x => basicDetails(x));
}

async function getById(id) {

    const account = await getAccount(id);
	const singleHistory = await getHistoryById(id);

	if( singleHistory.length > 0 ) {
		account.history = singleHistory.filter( function (sub) {
			return sub.id === account.id;
		});
	} else {
		account.history = [];
	}

    return basicDetails(account);
}

async function create(params) {
    // validate
    if (await db.Account.findOne({ where: { email: params.email } })) {
        throw 'Email "' + params.email + '" is already registered';
    }

    const account = new db.Account(params);
    account.verified = Date.now();

    // hash password
    account.passwordHash = await hash(params.password);

    // save account
	await account.save();

	return basicDetails(account);
}

async function update(id, params, editId) {
    const account = await getAccount(id);

	// validate (if email was changed)
	if (params.email && account.email !== params.email && await db.Account.findOne({ where: { email: params.email } })) {
		throw 'Email "' + params.email + '" is already taken';
	}

	// hash password if it was entered
	if (params.password) {
		params.passwordHash = await hash(params.password);
	}

	// copy params to account and save
	Object.assign(account, params);
	account.updated = Date.now();
	account.lastEditedBy = editId;
	await account.save();

	return basicDetails(account);

}

async function updateStatus(id, params, editId) {
	const account = await getAccount(id);

	account.status = params.status;
	account.updated = Date.now();
	account.lastEditedBy = editId;

	await account.save();

	return basicDetails(account);
}

async function _delete(id, editId) {
    const account = await getAccount(id);
	await account.update({updated: Date.now(), lastEditedBy: editId, status: false });
    await account.destroy();
}

async function restore(id, editId) {
	const account = await getAccount(id);
	await account.restore();
	await account.update({lastEditedBy: editId, status: true });

	return basicDetails(await getAccount(id));
}

// helper functions

async function getAccount(id) {
    const account = await db.Account.findByPk(id, {
		paranoid: false
	});
    if (!account) throw 'Account not found';
    return account;
}

async function getRefreshToken(token) {
	if( token == undefined || !token ) {
		throw 'Undefined token';
	}
    const refreshToken = await db.RefreshToken.findOne({ where: { token } });
    if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
    return refreshToken;
}

async function hash(password) {
    return await bcrypt.hash(password, bcryptSaltRounds);
}

function generateJwtToken(account) {
    // create a jwt token containing the account id that expires in 15 minutes
    return jwt.sign({ sub: account.id, id: account.id }, config.secret, { expiresIn: '15m' });
}

function generateRefreshToken(account, ipAddress) {
    // create a refresh token that expires in 7 days
    return new db.RefreshToken({
        accountId: account.id,
        token: randomTokenString(),
        expires: new Date(Date.now() + 7*24*60*60*1000),
        createdByIp: ipAddress
    });
}

function randomTokenString() {
    return crypto.randomBytes(40).toString('hex');
}

function basicDetails(account) {
	//return account;
    const { id, title, firstName, lastName, email, role, status, created, deletedAt, updated, isVerified, accountResearchers, history, version, lastEditedBy } = account;
    return { id, title, firstName, lastName, email, role, status, created, deletedAt, updated, isVerified, accountResearchers, history, version, lastEditedBy };
}

// EMAILS
async function sendRequestRole(account, role, origin) {
	let message;
	if (origin) {
		message = `<p>The following user (${account.email}) has requested to have their role updated to:</p>
					<p><strong>${role}</a></strong>`;
	} else {
		message = `<p>The following user (${account.email}) has requested to have their role updated to:</p>
			<p><strong>${role}</a></strong>`;
	}

	await sendEmail({
		to: 'ssibusiso@5ivedesign.co.za',
		subject: 'BAPP Platform- Role update request',
		html: `<h4>Role update request</h4>
			${message}`
	});
}

async function sendRequestProjectleader(account, projects, origin) {
	let message;
	if (origin) {
		message = `<p>The following user (${account.email}) has requested to be assigned as a Project Leader for the following projects:</p>`;

		message += `<ul>`;
		for (let index = 0; index < projects.length; index++) {
			const project = projects[index];
			message += `<li><strong>${project.title} (ID: ${project.id})</strong></li>`;
		}
		message += `</ul>`;


	} else {
		message = `<p>The following user (${account.email}) has requested to be assigned as a Project Leader for the following projects:</p>`;

		message += `<ul>`;
		for (let index = 0; index < projects.length; index++) {
			const project = projects[index];
			message += `<li><strong>${project.title} (ID: ${project.id})</strong></li>`;
		}
		message += `</ul>`;
	}

	await sendEmail({
		to: 'ssibusiso@5ivedesign.co.za',
		subject: 'BAPP Platform- Project Leader Request',
		html: `<h4>Project Leader Request</h4>
			${message}`
	});
}

async function sendVerificationEmail(account, origin) {
    let message;
    if (origin) {
        const verifyUrl = `${origin}/auth/verify-email?token=${account.verificationToken}`;
        message = `<p>Please click the below link to verify your email address:</p>
                   <p><a href="${verifyUrl}">${verifyUrl}</a></p>`;
    } else {
        message = `<p>Please use the below token to verify your email address with the <code>/auth/verify-email</code> api route:</p>
                   <p><code>${account.verificationToken}</code></p>`;
    }

    await sendEmail({
        to: account.email,
        subject: 'BAPP Platform- Verify Email',
        html: `<h4>Verify Email</h4>
               <p>Thanks for registering!</p>
               ${message}`
    });
}

async function sendAlreadyRegisteredEmail(email, origin) {
    let message;
    if (origin) {
        message = `<p>If you don't know your password please visit the <a href="${origin}/auth/forgot-password">forgot password</a> page.</p>`;
    } else {
        message = `<p>If you don't know your password you can reset it via the <code>/auth/forgot-password</code> api route.</p>`;
    }

    await sendEmail({
        to: email,
        subject: 'BAPP Platform- Email Already Registered',
        html: `<h4>Email Already Registered</h4>
               <p>Your email <strong>${email}</strong> is already registered.</p>
               ${message}`
    });
}

async function sendPasswordResetEmail(account, origin) {
    let message;
    if (origin) {
        const resetUrl = `${origin}/auth/password-reset?token=${account.resetToken}`;
        message = `<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>`;
    } else {
        message = `<p>Please use the below token to reset your password with the <code>/auth/password-reset</code> api route:</p>
                   <p><code>${account.resetToken}</code></p>`;
    }

    await sendEmail({
        to: account.email,
        subject: 'BAPP Platform- Reset Password',
        html: `<h4>Reset Password Email</h4>
               ${message}`
    });
}

async function getHistory() {

	const accountsHistories = await db.sequelizeInstance.query(
		"SELECT * FROM `accountHistories`",
		{
			type: db.sequelizeInstance.QueryTypes.SELECT
		}
	);

	return accountsHistories;
}

async function getHistoryById(id) {

	const accountHistory = await db.sequelizeInstance.query(
		"SELECT * FROM `accountHistories` WHERE id = ?",
		{
			replacements: [id],
			type: db.sequelizeInstance.QueryTypes.SELECT
		}
	);

	return accountHistory;
}
