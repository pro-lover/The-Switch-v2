const logger = require('node-color-log');

module.exports = errorHandler;

function errorHandler(err, req, res, next) {

	//logger.color('blue').bold().log( 'errorHandler err:', err);

	switch (true) {
		case typeof err === 'string':
			// custom application error
			const is404 = err.toLowerCase().endsWith('not found');
			const statusCode = is404 ? 404 : 400;
			return res.status(statusCode).json({ message: err });
		case err.name === 'UnauthorizedError':
			// jwt authentication error
			return res.status(401).json({ message: 'Unauthorized' });
		case err.name === 'ForbiddenError':
			//logger.color('red').bold().log( 'ForbiddenError', req.headers);
			////console.log('ForbiddenError', JSON.stringify(req.headers));
			return res.status(403).json({ message: err.message });
		default:
			//logger.color('red').bold().log( 'ERR', err);
			return res.status(500).json({ message: err.message });
	}
}
