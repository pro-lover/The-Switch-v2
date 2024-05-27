const express = require('express');
const router = express.Router();
const Joi = require('joi');
const path = require('path');

const validateRequest = require(path.join(__dirname, '../middleware/validate-request'));
const authorize = require(path.join(__dirname, '../middleware/authorize'));
const Role = require(path.join(__dirname, '../shared/role'));
const tasktypeService = require(path.join(__dirname, '../services/tasktype.service'));

// routes
router.get('/', authorize(), getAll);
router.get('/:id', authorize(), getById);

router.post('/', authorize([Role.Admin, Role.Developer, Role.ProjectLeader]), createSchema, create);
router.put('/:id/restore', authorize([Role.Admin, Role.Developer, Role.ProjectLeader]), restore);
router.put('/:id/update-status', authorize([Role.Admin, Role.Developer]), updateStatusSchema, updateStatus);
router.put('/:id', authorize([Role.Admin, Role.Developer, Role.ProjectLeader]), updateSchema, update);
router.delete('/:id', authorize([Role.Admin, Role.Developer, Role.ProjectLeader]), _delete);

module.exports = router;

function getAll(req, res, next) {
	tasktypeService.getAll(req.user.role)
		.then(models => res.json(models))
		.catch(next);
}

function getById(req, res, next) {

	if ( Number(req.params.id) ) {
		tasktypeService.getById(req.params.id)
			.then(model => model ? res.json(model) : res.sendStatus(404))
			.catch(next);
    } else {
		return res.status(401).json({ message: 'Unauthorized' });
	}
}

function createSchema(req, res, next) {
	const schema = Joi.object({
		name: Joi.string().required(),
		description: Joi.string().required()
    });
	validateRequest(req, next, schema);
}

function create(req, res, next) {
	tasktypeService.create(req.body, req.user.id)
		.then(model => res.json(model))
		.catch(next);
}

function updateSchema(req, res, next) {
	const schemaRules = Joi.object({
		name: Joi.string().required(),
		description: Joi.string().required()
	});
    validateRequest(req, next, schemaRules);
}

function update(req, res, next) {

	if ( Number(req.params.id) ) {
		tasktypeService.update(req.params.id, req.body, req.user.id)
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
		tasktypeService.updateStatus(req.params.id, req.body, req.user.id)
			.then(model => res.json(model))
			.catch(next);
	} else {
		return res.status(401).json({ message: 'Unauthorized' });
	}
}

function _delete(req, res, next) {

    if ( Number(req.params.id) ) {
		tasktypeService.delete(req.params.id, req.user.id)
			.then(model => res.json(model))
			.catch(next);
    } else {
		return res.status(401).json({ message: 'Unauthorized' });
	}
}

function restore(req, res, next) {

	if ( Number(req.params.id) ) {
		tasktypeService.restore(req.params.id, req.user.id)
			.then(model => res.json(model))
			.catch(next);
	} else {
		return res.status(401).json({ message: 'Unauthorized' });
	}
}
// helper functions
