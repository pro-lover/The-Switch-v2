const express = require('express');
const router = express.Router();
const Joi = require('joi');
const path = require('path');

const validateRequest = require(path.join(__dirname, '../middleware/validate-request'));
const authorize = require(path.join(__dirname, '../middleware/authorize'));
const Role = require(path.join(__dirname, '../shared/role'));
const templateService = require(path.join(__dirname, '../services/template.service'));

// routes
router.get('/', authorize(), getAll);
router.get('/:id', authorize(), getById);

router.post('/', authorize([Role.Admin, Role.Designer, Role.Developer]), createSchema, create);
router.put('/:id/restore', authorize([Role.Admin, Role.Designer, Role.Developer]), restore);
router.put('/:id/update-status', authorize([Role.Admin, Role.Designer, Role.Developer]), updateStatusSchema, updateStatus);
router.put('/:id', authorize([Role.Admin, Role.Designer, Role.Developer]), updateSchema, update);
router.delete('/:id', authorize([Role.Admin, Role.Designer, Role.Developer]), _delete);

module.exports = router;

function getAll(req, res, next) {

	templateService.getAll(req.user.role)
		.then(models => res.json(models))
		.catch(next);

}

function getById(req, res, next) {

	if ( Number(req.params.id) ) {
        templateService.getById(req.params.id)
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
		clientId: Joi.number().required(),
		bannertypeId: Joi.number().required(),
		banners: Joi.any().required(),
    });
	validateRequest(req, next, schema);
}

function create(req, res, next) {
	templateService.create(req.body, req.user.id)
		.then(model => res.json(model))
		.catch(next);
}

function updateSchema(req, res, next) {
	const schemaRules = Joi.object({
		name: Joi.string().required(),
		description: Joi.string().required(),
		clientId: Joi.number().required(),
		bannertypeId: Joi.number().required(),
		banners: Joi.any().required(),
	});
    validateRequest(req, next, schemaRules);
}

function update(req, res, next) {

	if ( Number(req.params.id) ) {
		templateService.update(req.params.id, req.body, req.user.id)
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
		templateService.updateStatus(req.params.id, req.body, req.user.id)
			.then(model => res.json(model))
			.catch(next);
	} else {
		//console.log('WTF', req.params.id);
		return res.status(401).json({ message: 'Unauthorized' });
	}
}

function _delete(req, res, next) {

    if ( Number(req.params.id) ) {
        templateService.delete(req.params.id, req.user.id)
			.then(model => res.json(model))
			.catch(next);
    } else {
		return res.status(401).json({ message: 'Unauthorized' });
	}
}

function restore(req, res, next) {

	if ( Number(req.params.id) ) {
		templateService.restore(req.params.id, req.user.id)
			.then(model => res.json(model))
			.catch(next);
	} else {
		return res.status(401).json({ message: 'Unauthorized' });
	}
}
// helper functions
