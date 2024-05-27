﻿const path = require('path');
const db = require(path.join(__dirname, '../shared/db'));
const { Sequelize, Op } = require('sequelize');

module.exports = {
	getAll,
	getById,
	create,
	update,
	updateStatus,
	restore,
	delete: _delete
};

async function getAll(reqRole) {

	const paranoidRequest = (reqRole === 'Admin') ? false : true;

	const modelsHistories = await getHistory();

    const models = await db.Task.findAll({
		paranoid: paranoidRequest,
		order: [
			['name', 'ASC']
		],
		/** /
		include:[
			{
				//model: db.Banner,
				//as:'banners',
				//required:false
			}
		]
		/**/
	});

	if( modelsHistories.length > 0 ) {
		models.forEach( function(prime) {
			prime.history = modelsHistories.filter( function (sub) {
				return sub.id === prime.id;
			});
		});
	} else {
		models.forEach( function(prime) {
			prime.history = [];
		});
	}

    return models.map(x => basicDetails(x));
}

async function getById(id) {
    const model = await getTask(id);
	const modelHistory = await getHistoryById(id);

	if( modelHistory.length > 0 ) {
		model.history = modelHistory.filter( function (sub) {
			return sub.id === model.id;
		});
	} else {
		model.history = [];
	}

    return basicDetails(model);
}

async function create(params, editId) {
	// validate
	if (await db.Task.findOne({ where: {
		[Op.or]: [{name: params.name}, {description: params.description}]
		} }))
	{
		throw 'Task already exists. Please provide a unique Name and description.';
	}

    const model = new db.Task(params);
	model.lastEditedBy = editId;
    // save model
    await model.save();

    return basicDetails(await getTask(model.id));
}

async function update(id, params, editId) {
    const model = await getTask(id);

	// validate (if name/shortname was changed)
	if (params.name && model.name == params.name && model.description == params.description ) {
		throw 'Task hasn\'t been updated.';
	}
	// validate (if name/shortname is unique in db)
	if ( params.name && (model.name !== params.name) && await db.Task.findOne({ where: { name: params.name } })) {
		throw 'Task already exists.';
	}

    // copy params to model and save
    Object.assign(model, params);
    model.updated = Date.now();
	model.lastEditedBy = editId;
    await model.save();

    return basicDetails(model);
}

async function updateStatus(id, params, editId) {
	const model = await getTask(id);

	model.status = params.status;
	model.updated = Date.now();
	model.lastEditedBy = editId;

	await model.save();

	return basicDetails(model);
}

async function _delete(id, editId) {
    const model = await getTask(id);
	await model.update({updated: Date.now(), lastEditedBy: editId, status: false });
    await model.destroy();
	return basicDetails(model);
}

async function restore(id, editId) {
	const model = await getTask(id);
	await model.restore();
	await model.update({lastEditedBy: editId, status: true });
	return basicDetails(model);
}

// helper functions

async function getTask(id) {
	//const transaction = await db.sequelizeInstance.transaction({isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED});
    const model = await db.Task.findByPk(id, {
		paranoid: false,
		/** /
		include:[
			{
				//model: db.Banner,
				//as:'banners',
				//required:false
			}
		]
		/**/
		//lock: true,
		//transaction,
		/** /
		lock: {
			level: transaction.LOCK,
			of: db.Task
		},
		/**/
	});
    if (!model) throw 'Task not found';
    return model;
}

async function getHistory() {

	const modelHistories = await db.sequelizeInstance.query(
		"SELECT * FROM `taskHistories`",
		{
			type: db.sequelizeInstance.QueryTypes.SELECT
		}
	);

	return modelHistories;
}

async function getHistoryById(id) {

	const modelHistories = await db.sequelizeInstance.query(
		"SELECT * FROM `taskHistories` WHERE id = ?",
		{
			replacements: [id],
			type: db.sequelizeInstance.QueryTypes.SELECT
		}
	);

	return modelHistories;
}

function basicDetails(model) {
	const { id, name, description, jobNumber, status, created, updated, deletedAt, history, version, lastEditedBy } = model;
	return { id, name, description, jobNumber, status, created, updated, deletedAt, history, version, lastEditedBy };
}
