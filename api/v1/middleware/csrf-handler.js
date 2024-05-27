const logger = require('node-color-log');

module.exports = csrfHandler;

function csrfHandler(err, req, res, next) {

	let token = req.csrfToken();
	res.cookie('XSRF-TOKEN', token, { httpOnly: true, secure: true });
	res.locals.csrfToken = token;

	//logger.color('red').bold().log( 'csrfHandler req.method:', req.method, res.locals.csrfToken);

	next();
}
