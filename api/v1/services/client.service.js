const path = require('path');
const db = require(path.join(__dirname, '../shared/db'));
const { Op } = require('sequelize');

module.exports = {
	getAll,
	getById,
	create,
	update,
	restore,
	updateStatus,
	delete: _delete
};

async function getAll(reqRole) {

	const paranoidRequest = (reqRole === 'Admin') ? false : true;

	const allHistories = await getHistory();
    const models = await db.Client.findAll({
		paranoid: paranoidRequest,
		include:[
			{
				model: db.Project,
				as:'projects',
				required: false
			},
			{
				model: db.Templates,
				as:'templates',
				required: false
			}

		]
	});

	if( allHistories.length > 0 ) {

		models.forEach( function(prime) {
			prime.history = allHistories.filter( function (sub) {
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
    const model = await getClient(id);
	const singleHistory = await getHistoryById(id);

	if( singleHistory.length > 0 ) {
		model.history = singleHistory.filter( function (sub) {
			return sub.id === model.id;
		});
	} else {
		model.history = [];
	}

	////console.log(model);
    return basicDetails(model);
}

async function create(params, editId) {

	// validate
	if (await db.Client.findOne({ where: {
		[Op.or]: [{name: params.name}, {description: params.description}]
		} }))
	{
		throw 'Client already exists. Please provide a unique Name and description.';
	}

	const model = new db.Client(params);
	model.lastEditedBy = editId;
	// save project
	await model.save();

	return basicDetails(await getClient(model.id));
}

async function update(id, params, editId) {
	const model = await getClient(id);

	////console.log('projectResearcher:');

    // validate
	// validate (if name/shortname was changed)
	if (params.name && model.name == params.name && model.description == params.description ) {
		throw 'Client hasn\'t been updated.';
	}
	// validate (if name/shortname is unique in db)
	if ( params.name && (model.name !== params.name) && await db.Client.findOne({ where: { name: params.name } })) {
		throw 'Client already exists.';
	}

	// copy params to model and save
	Object.assign(model, params);
	model.updated = Date.now();
	model.lastEditedBy = editId;
	await model.save();

	return basicDetails(model);
}

async function updateStatus(id, params, editId) {
	const model = await getClient(id);

	model.status = params.status;
	model.updated = Date.now();
	model.lastEditedBy = editId;

	await model.save();

	return basicDetails(model);
}

async function _delete(id, editId) {
    const model = await getClient(id);
	await model.update({updated: Date.now(), lastEditedBy: editId, status: false });
    await model.destroy();

	return basicDetails(model);
}

async function restore(id, editId) {
	const model = await getClient(id);
	await model.restore();
	await model.update({lastEditedBy: editId, status: true });

	return basicDetails(model);
}

// helper functions

async function getClient(id) {
	////console.log('looking for:', id);
    const model = await db.Client.findByPk(id, {
		paranoid: false,
		include:[
			{
				model: db.Project,
				as:'projects',
				required: false
			},
			{
				model: db.Templates,
				as:'templates',
				required: false
			}

		]
	});
    if (!model) throw 'Client not found';
    return model;
}

async function getHistory() {

	const modelHistories = await db.sequelizeInstance.query(
		"SELECT * FROM `clientHistories`",
		{
			type: db.sequelizeInstance.QueryTypes.SELECT
		}
	);

	return modelHistories;
}

async function getHistoryById(id) {

	const modelHistories = await db.sequelizeInstance.query(
		"SELECT * FROM `clientHistories` WHERE id = ?",
		{
			replacements: [id],
			type: db.sequelizeInstance.QueryTypes.SELECT
		}
	);

	return modelHistories;
}

function basicDetails(model) {
	const { id, name, description, created, updated, status, deletedAt, history, version, lastEditedBy, projects, templates } = model;
	return { id, name, description, created, updated, status, deletedAt, history, version, lastEditedBy, projects, templates };
}
