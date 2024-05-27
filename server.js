require('rootpath')();
const path = require('path');
const fs = require("fs");
const https = require("https");
const http = require("http");
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const csrf = require('csurf');

const logger = require('morgan');
const loggColour = require('node-color-log');

const API_VERSION = 'v1';

const csrfHandler = require( path.join(__dirname, 'api/' + API_VERSION + '/middleware/csrf-handler') );
const errorHandler = require( path.join(__dirname, 'api/' + API_VERSION + '/middleware/error-handler') );

//WEBSOCKET
const WebSocket = require('ws');
const websocketServer = require(path.join(__dirname,  'api/' + API_VERSION + '/shared/server.websocket'));

// You can set morgan to log differently depending on your environment
// PROD HARD FIX
//app.use(logger('common', { skip: function(req, res) { return res.statusCode < 400 }, stream: __dirname + '/morgan.log' }));
/** /
if ( process.env.NODE_ENV == 'production') {
	app.use(logger('common', { skip: function(req, res) { return res.statusCode < 400 }, stream: __dirname + '/morgan.log' }));
} else {
	app.use(logger('dev'));
}
/**/

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

// allow cors requests from any origin and with credentials
app.use(cors({ origin: (origin, callback) => callback(null, true), credentials: true }));

//Compress all routes
app.use(compression());

//app.use(express.static(app.root + '/assets/public', { maxAge: 86400000 /* 1d */ }));
app.use(express.static( path.join(__dirname, 'api/assets/scripts')));
app.use(express.static( path.join(__dirname, 'api/assets/public')));
app.use(express.static( path.join(__dirname, 'api/assets/boilerplates')));


//protect against well known vulnerabilities
app.use(helmet());

const csrfProtection = csrf({
	cookie: {
		key: 'XSRF-TOKEN'
	},
	//ignoreMethods: ['OPTIONS'],
	//ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
});

app.set('trust proxy', 1);

// api access routes
app.use('/accounts', csrfProtection, csrfHandler, require(path.join(__dirname, 'api/' + API_VERSION + '/controllers/accounts.controller')));
// api core routes
app.use('/tasks', csrfProtection, csrfHandler, require(path.join(__dirname, 'api/' + API_VERSION + '/controllers/tasks.controller')));
app.use('/clients', csrfProtection, csrfHandler, require(path.join(__dirname, 'api/' + API_VERSION + '/controllers/clients.controller')));
app.use('/projects', csrfProtection, csrfHandler, require(path.join(__dirname, 'api/' + API_VERSION + '/controllers/projects.controller')));
app.use('/templates', csrfProtection, csrfHandler, require(path.join(__dirname, 'api/' + API_VERSION + '/controllers/templates.controller')));
app.use('/components', csrfProtection, csrfHandler, require(path.join(__dirname, 'api/' + API_VERSION + '/controllers/components.controller')));
app.use('/containers', csrfProtection, csrfHandler, require(path.join(__dirname, 'api/' + API_VERSION + '/controllers/containers.controller')));
app.use('/banners', csrfProtection, csrfHandler, require(path.join(__dirname, 'api/' + API_VERSION + '/controllers/banners.controller')));
app.use('/animations', csrfProtection, csrfHandler, require(path.join(__dirname, 'api/' + API_VERSION + '/controllers/animations.controller')));
app.use('/taxonomies', csrfProtection, csrfHandler, require(path.join(__dirname, 'api/' + API_VERSION + '/controllers/taxonomies.controller')));

// api lookup fields
app.use('/animationtypes', csrfProtection, csrfHandler, require(path.join(__dirname, 'api/' + API_VERSION + '/controllers/animationtypes.controller')));
app.use('/bannersizes', csrfProtection, csrfHandler, require(path.join(__dirname, 'api/' + API_VERSION + '/controllers/bannersizes.controller')));
app.use('/bannertypes', csrfProtection, csrfHandler, require(path.join(__dirname, 'api/' + API_VERSION + '/controllers/bannertypes.controller')));
app.use('/componenttypes', csrfProtection, csrfHandler, require(path.join(__dirname, 'api/' + API_VERSION + '/controllers/componenttypes.controller')));
app.use('/easingtypes', csrfProtection, csrfHandler, require(path.join(__dirname, 'api/' + API_VERSION + '/controllers/easingtypes.controller')));
app.use('/eventtypes', csrfProtection, csrfHandler, require(path.join(__dirname, 'api/' + API_VERSION + '/controllers/eventtypes.controller')));
app.use('/fonttypes', csrfProtection, csrfHandler, require(path.join(__dirname, 'api/' + API_VERSION + '/controllers/fonttypes.controller')));
app.use('/tasktypes', csrfProtection, csrfHandler, require(path.join(__dirname, 'api/' + API_VERSION + '/controllers/tasktypes.controller')));

// swagger docs route
app.use('/api-docs', require( path.join(__dirname, 'api/' + API_VERSION + '/shared/swagger') ) );

// global error handler
app.use(errorHandler);



// HTTP start server
const port = 4000;

// HTTPS start server
if( process.env.NODE_ENV === 'production' ) {
	const httpsServer = https.createServer({
		key: fs.readFileSync('/opt/bitnami/apache/conf/cmdbanner.io.key'), // cert invalid
		cert: fs.readFileSync('/opt/bitnami/apache/conf/cmdbanner.io.crt'), // cert invalid
	}, app).listen(port, () => console.log('HTTPS Server listening on port ' + port));
} else {

	//app.listen(port, () => console.log('HTTP Server listening on port ' + port));

	//initialize a simple http server
	const server = http.createServer(app);

	server.listen(port, () => {
		console.log(`HTTP server started on port ${server.address().port} :)`);
	});

	//initialize the WebSocket server instance
	const wss = new WebSocket.Server({ server });

	wss.on('connection', (ws) => {

		console.log('WS connection');

		ws.isAlive = true;

		ws.on('pong', () => {
			ws.isAlive = true;
		});

		ws.on('error', (err) => {
			console.warn(`Client disconnected - reason: ${err}`);
		});

		ws.on('message', (msg) => {

			const message = JSON.parse(msg);

			console.log(`Received message`, message);

			setTimeout(() => {
				if (message.isBroadcast) {

					//send back the message to the other clients
					wss.clients
						.forEach(client => {
							if (client != ws) {
								client.send(
									JSON.stringify({
										'content': 'CMDBNR.IO: ' + message.content,
										'channel': message.channel,
										'model': message.model,
										'action': message.action,
										'modelId': message.modelId,
										'isBroadcast': message.isBroadcast,
										'sender': message.sender
									})
									/** /
									websocketServer.createMessage(
										message.content,
										true,
										message.sender
									)
									/**/
								);
							}
						});

				}

				//ws.send(websocketServer.createMessage(`You sent -> ${message.content}`, message.isBroadcast));

			}, 1000);

		});

		/** /
		setInterval(() => {

			wss.clients.forEach((ws) => {
				//const extWs = ws as ExtWebSocket;

				if (!ws.isAlive) {
					console.log('Kill websocket');
					return ws.terminate();
				};

				ws.isAlive = false;
				ws.ping(null, undefined);
			});

		}, 10000);
		/**/

		/** /
		//send immediatly a feedback to the incoming connection
		ws.send(websocketServer.createMessage('Hi there, I am a WebSocket server'));
		/**/
	});
}
