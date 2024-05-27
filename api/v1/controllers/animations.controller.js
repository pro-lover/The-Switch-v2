const express = require('express');
const router = express.Router();
const Joi = require('joi');
const path = require('path');

const validateRequest = require(path.join(__dirname, '../middleware/validate-request'));
const authorize = require(path.join(__dirname, '../middleware/authorize'));
const Role = require(path.join(__dirname, '../shared/role'));
const animationService = require(path.join(__dirname, '../services/animation.service'));

// routes
router.get('/', authorize(), getAll);
router.get('/:id', authorize(), getById);

router.post('/', authorize([Role.Admin, Role.Designer, Role.Developer]), createSchema, create);
router.put('/:id/restore', authorize([Role.Admin, Role.Designer, Role.Developer]), restore);
router.put('/:id/update-meta', authorize([Role.Admin, Role.Designer, Role.Developer]), updateMeta);
router.put('/:id/update-status', authorize([Role.Admin, Role.Designer, Role.Developer]), updateStatusSchema, updateStatus);
router.put('/:id', authorize([Role.Admin, Role.Designer, Role.Developer]), updateSchema, update);
router.delete('/:id', authorize([Role.Admin, Role.Designer, Role.Developer]), _delete);

module.exports = router;

function getAll(req, res, next) {
	animationService.getAll(req.user.role)
		.then(models => res.json(models))
		.catch(next);
}

function getById(req, res, next) {

	if ( Number(req.params.id) ) {
		animationService.getById(req.params.id)
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
		timelineorder: Joi.number().required(),
		animationloop: Joi.boolean().required(),
		animationtypeId: Joi.number().required(),
		easingtypeId: Joi.number().required(),
		componentId: Joi.number().required(),
		animationmeta: Joi.any().required(),
    });
	validateRequest(req, next, schema);
}

function create(req, res, next) {
	animationService.create(req.body, req.user.id)
		.then(model => res.json(model))
		.catch(next);
}

function updateSchema(req, res, next) {
	const schemaRules = Joi.object({
		name: Joi.string().required(),
		description: Joi.string().required(),
		timelineorder: Joi.number().required(),
		animationloop: Joi.boolean().required(),
		animationtypeId: Joi.number().required(),
		easingtypeId: Joi.number().required(),
		componentId: Joi.number().required(),
		status: Joi.boolean().required(),
	});
    validateRequest(req, next, schemaRules);
}

function update(req, res, next) {

	if ( Number(req.params.id) ) {
		animationService.update(req.params.id, req.body, req.user.id)
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
		animationService.updateStatus(req.params.id, req.body, req.user.id)
			.then(model => res.json(model))
			.catch(next);
	} else {
		return res.status(401).json({ message: 'Unauthorized' });
	}
}

function updateMetaSchema(req, res, next) {
	const schemaRules = Joi.object({
		animationmeta: Joi.object().required()
	});
	validateRequest(req, next, schemaRules);
}

function updateMeta(req, res, next) {

	if ( Number(req.params.id) ) {
		animationService.updateMeta(req.params.id, req.body, req.user.id)
			.then(model => res.json(model))
			.catch(next);
    } else {
		return res.status(401).json({ message: 'Unauthorized' });
	}
}

function _delete(req, res, next) {

    if ( Number(req.params.id) ) {
        animationService.delete(req.params.id, req.user.id)
			.then(model => res.json(model))
			.catch(next);
    } else {
		return res.status(401).json({ message: 'Unauthorized' });
	}
}

function restore(req, res, next) {

	if ( Number(req.params.id) ) {
		animationService.restore(req.params.id, req.user.id)
			.then(model => res.json(model))
			.catch(next);
	} else {
		return res.status(401).json({ message: 'Unauthorized' });
	}
}
// helper functions
