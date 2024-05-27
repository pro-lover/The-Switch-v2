const fs = require('fs');
const express = require('express');
const router = express.Router();
const Joi = require('joi');
const path = require('path');
const logger = require('node-color-log');
const bodyParser = require('body-parser');
const multer  = require('multer');

//const upload = multer({ storage: storage });
const upload = multer({ dest: path.join(__dirname, '../../assets/public/templates/') });

const validateRequest = require(path.join(__dirname, '../middleware/validate-request'));
const authorize = require(path.join(__dirname, '../middleware/authorize'));
const Role = require(path.join(__dirname, '../shared/role'));
const componentService = require(path.join(__dirname, '../services/component.service'));

// routes
router.get('/', authorize(), getAll);
router.get('/:id', authorize(), getById);

router.post('/', authorize([Role.Admin, Role.Designer, Role.Developer]), createSchema, create);
router.post('/upload-asset', bodyParser.urlencoded({extended: true}), authorize([Role.Admin, Role.Designer, Role.Developer]), upload.single('file'), uploadAsset );

router.put('/:id/restore', authorize([Role.Admin, Role.Designer, Role.Developer]), restore);
router.put('/:id/update-meta', authorize([Role.Admin, Role.Designer, Role.Developer]), updateMeta);
router.put('/:id/update-status', authorize([Role.Admin, Role.Designer, Role.Developer]), updateStatusSchema, updateStatus);
router.put('/:id/update-smartstatus', authorize([Role.Admin, Role.Designer, Role.Developer]), updateStatusSchema, updateSmartStatus);
router.put('/:id', authorize([Role.Admin, Role.Designer, Role.Developer]), updateSchema, update);

router.delete('/:id', authorize([Role.Admin, Role.Designer, Role.Developer]), _delete);

module.exports = router;

function getAll(req, res, next) {
	componentService.getAll(req.user.role)
		.then(models => res.json(models))
		.catch(next);
}

function getById(req, res, next) {
    // admins can get any model
	if ( Number(req.params.id) ) {
		componentService.getById(req.params.id)
			.then(model => model ? res.json(model) : res.sendStatus(404))
			.catch(next);
    } else {
		return res.status(401).json({ message: 'Unauthorized' });
	}
}

function createSchema(req, res, next) {
	const schema = Joi.object({
		name: Joi.string().required(),
		description: Joi.string().required(),
		componenttypeId: Joi.number().required(),
		containerId: Joi.number().required(),
		componentmeta: Joi.any().required(),
    });
	validateRequest(req, next, schema);
}

function create(req, res, next) {
	componentService.create(req.body, req.user.id)
		.then(model => res.json(model))
		.catch(next);
}

function uploadSchema(req, res, next) {

	const schema = Joi.object({
		filepath: Joi.string().required()
    });
	validateRequest(req, next, schema);
}

function uploadAsset(req, res, next) {

	//console.log('req.body.filepath:', req.body.filepath);
	//console.log('req.file:', req.file);

	const dir = path.join(__dirname, '../../assets/public/templates/' + req.body.filepath);
	if (!fs.existsSync(dir)){
		fs.mkdirSync(dir, { recursive: true });
	}

	fs.renameSync( req.file.path, dir + '/' + req.file.originalname);
	//logger.color('green').bold().log( 'req.path:', req.method, req);

	let onlinepath = '';
	// PROD HARD FIX
	//onlinepath = 'https://development.cmdbanner.io:4000/templates/' + req.body.filepath + '/' + req.file.originalname;
	/**/
	if( process.env.NODE_ENV === 'production' ) {
		onlinepath = 'https://development.cmdbanner.io:4000/templates/' + req.body.filepath + '/' + req.file.originalname;
	} else {
		onlinepath = 'http://localhost:4000/templates/' + req.body.filepath + '/' + req.file.originalname;
	}
	/**/

	res.json({
		message: 'Component Asset Uploaded successfully',
		data: onlinepath
	});
}

function updateSchema(req, res, next) {
	const schemaRules = Joi.object({
		componentId: Joi.number().required(),
		name: Joi.string().required(),
		description: Joi.string().required(),
		componenttypeId: Joi.number().required(),
		containerId: Joi.number().required(),
		smart: Joi.boolean().required(),
		status: Joi.boolean().required(),
	});
    validateRequest(req, next, schemaRules);
}

function update(req, res, next) {

	if ( Number(req.params.id) ) {
		componentService.update(req.params.id, req.body, req.user.id)
			.then(model => res.json(model))
			.catch(next);
    } else {
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

	if ( Number(req.params.id) ) {
		componentService.updateStatus(req.params.id, req.body, req.user.id)
			.then(model => res.json(model))
			.catch(next);
	} else {
		return res.status(401).json({ message: 'Unauthorized' });
	}
}

function updateSmartStatus(req, res, next) {

	if ( Number(req.params.id) ) {
		componentService.updateSmartStatus(req.params.id, req.body, req.user.id)
			.then(model => res.json(model))
			.catch(next);
	} else {
		return res.status(401).json({ message: 'Unauthorized' });
	}
}

function updateMeta(req, res, next) {

	if ( Number(req.params.id) ) {
		componentService.updateMeta(req.params.id, req.body, req.user.id)
			.then(model => res.json(model))
			.catch(next);
    } else {
		return res.status(401).json({ message: 'Unauthorized' });
	}
}

function _delete(req, res, next) {

    if ( Number(req.params.id) ) {
        componentService.delete(req.params.id, req.user.id)
			.then(model => res.json(model))
			.catch(next);
    } else {
		return res.status(401).json({ message: 'Unauthorized' });
	}
}

function restore(req, res, next) {

	if ( Number(req.params.id) ) {
		componentService.restore(req.params.id, req.user.id)
			.then(model => res.json(model))
			.catch(next);
	} else {
		return res.status(401).json({ message: 'Unauthorized' });
	}
}
// helper functions
