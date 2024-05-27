const path = require('path');
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

    const models = await db.FontType.findAll({
		paranoid: paranoidRequest,
		order: [
			['name', 'ASC']
		]
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
    const model = await getFontType(id);
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
	if (await db.FontType.findOne({ where: {
			name: params.name
			//[Op.or]: [{name: params.name}, {styleSheet: params.styleSheet}]
		} }))
	{
		throw 'Font Type already exists. Please provide a unique Name and Path to a stylesheet.';
	}

    const model = new db.FontType(params);
	model.lastEditedBy = editId;
    // save model
    await model.save();

    return basicDetails(await getFontType(model.id));
}

async function update(id, params, editId) {
    const model = await getFontType(id);

	// validate (if name/shortname is unique in db)
	if ( params.name && (model.name !== params.name) && await db.FontType.findOne({ where: { name: params.name } })) {
		throw 'Font Type already exists.';
	}

    // copy params to model and save
    Object.assign(model, params);
    model.updated = Date.now();
	model.lastEditedBy = editId;
    await model.save();

    return basicDetails(model);
}

async function updateStatus(id, params, editId) {
	const model = await getFontType(id);

	model.status = params.status;
	model.updated = Date.now();
	model.lastEditedBy = editId;

	await model.save();

	return basicDetails(model);
}

async function _delete(id, editId) {
    const model = await getFontType(id);
	await model.update({updated: Date.now(), lastEditedBy: editId, status: false });
    await model.destroy();
	return basicDetails(model);
}

async function restore(id, editId) {
	const model = await getFontType(id);
	await model.restore();
	await model.update({lastEditedBy: editId, status: true });
	return basicDetails(model);
}

// helper functions

async function getFontType(id) {
	//const transaction = await db.sequelizeInstance.transaction({isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED});
    const model = await db.FontType.findByPk(id, {
		paranoid: false,
		/** /
		include:[
			//{
			//	model: db.Banner,
			//	as:'banners',
			//	required:false
			//}
		],
		/**/
		//lock: true,
		//transaction,
		/** /
		lock: {
			level: transaction.LOCK,
			of: db.FontType
		},
		/**/
	});
    if (!model) throw 'Font Type not found';
    return model;
}

async function getHistory() {

	const modelHistories = await db.sequelizeInstance.query(
		"SELECT * FROM `fonttypeHistories`",
		{
			type: db.sequelizeInstance.QueryTypes.SELECT
		}
	);

	return modelHistories;
}

async function getHistoryById(id) {

	const modelHistories = await db.sequelizeInstance.query(
		"SELECT * FROM `fonttypeHistories` WHERE id = ?",
		{
			replacements: [id],
			type: db.sequelizeInstance.QueryTypes.SELECT
		}
	);

	return modelHistories;
}

function basicDetails(model) {
    const { id, name, description, fontFamily, fontStyle, fontWeight, styleSheet, status, created, updated, deletedAt, history, version, lastEditedBy } = model;
    return { id, name, description, fontFamily, fontStyle, fontWeight, styleSheet, status, created, updated, deletedAt, history, version, lastEditedBy };
}
