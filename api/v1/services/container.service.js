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

    const models = await db.Container.findAll({
		paranoid: paranoidRequest,
		include:[
			{
				model: db.Banner,
				as:'banner',
				required:false,
				include:[
					{
						model: db.BannerType,
						as:'bannertype',
						required:false
					},
					{
						model: db.BannerSize,
						as:'bannersize',
						required:false
					},

				]
			},
			{
				model: db.Component,
				as:'components',
				required:false,
				//paranoid: false,
				include:[
					{
						model: db.ComponentType,
						//as:'componentmeta',
						required:false
					},
					{
						model: db.ComponentMeta,
						//paranoid: false,
						//as:'componentmeta',
						required:false
					},
					{
						model: db.Animation,
						required:false,
						include: [
							{
								model: db.AnimationMeta,
								as:'animationmeta',
								required:false
							},
							{
								model: db.AnimationType,
								required:false
							},
							{
								model: db.EasingType,
								required:false
							},
						]
					}
				]
			}
		],
		order: [
			['displayorder', 'ASC'],
			[ {model: db.Component, as: 'components'}, 'name', 'ASC'],
			[ {model: db.Component, as: 'components'}, {model: db.Animation, as: 'animations'}, 'timelineorder', 'ASC']
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
    const model = await getContainer(id);
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
	//if (await db.Container.findOne({ where: {
	//	[Op.or]: [{name: params.name}, {description: params.description}]
	//	} }))
	//{
	//	throw 'Container already exists. Please provide a unique Name and description.';
	//}
	if ( await db.Container.findOne({ where: {
			name: params.name,
			bannerId: params.bannerId
		}})
	)
	{
		throw 'Container name already exists for the Creative.';
	}

    const model = new db.Container(params);
	model.lastEditedBy = editId;
    // save model
    await model.save();

    return basicDetails(await getContainer(model.id));
}

async function update(id, params, editId) {
    const model = await getContainer(id);

	// validate (if name/shortname was changed)
	//if (params.name && model.name == params.name && model.description == params.description ) {
	//	throw 'Container hasn\'t been updated.';
	//}
	// validate (if name/shortname is unique in db)
	if ( params.name && (model.name !== params.name) && await db.Container.findOne({ where: {
				name: params.name,
				bannerId: params.bannerId
			}})
		)
	{
		throw 'Container name already exists.';
	}

    // copy params to model and save
    Object.assign(model, params);

	//console.log('Container update params: ', params);
	//console.log('Container before update: ', model);

    model.updated = Date.now();
	model.lastEditedBy = editId;
    await model.save();

    return basicDetails(model);
}

async function updateStatus(id, params, editId) {
	const model = await getContainer(id);

	model.status = params.status;
	model.updated = Date.now();
	model.lastEditedBy = editId;

	await model.save();

	return basicDetails(model);
}

async function _delete(id, editId) {
    const model = await getContainer(id);
	await model.update({updated: Date.now(), lastEditedBy: editId, status: false });
    await model.destroy();
	return basicDetails(model);
}

async function restore(id, editId) {
	const model = await getContainer(id);
	await model.restore();
	await model.update({lastEditedBy: editId, status: true });
	return basicDetails(model);
}

// helper functions

async function getContainer(id) {
	//const transaction = await db.sequelizeInstance.transaction({isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED});
    const model = await db.Container.findByPk(id, {
		paranoid: false,
		include:[
			{
				model: db.Banner,
				as:'banner',
				required:false,
				include:[
					{
						model: db.BannerType,
						as:'bannertype',
						required:false
					},
					{
						model: db.BannerSize,
						as:'bannersize',
						required:false
					}
				]
			},
			{
				model: db.Component,
				as:'components',
				required:false,
				//paranoid: false,
				include:[
					{
						model: db.ComponentType,
						//as:'componentmeta',
						required:false
					},
					{
						model: db.ComponentMeta,
						//paranoid: false,
						//as:'componentmeta',
						required:false
					},
					{
						model: db.Animation,
						required:false,
						include: [
							{
								model: db.AnimationMeta,
								as:'animationmeta',
								required:false
							},
							{
								model: db.AnimationType,
								required:false
							},
							{
								model: db.EasingType,
								required:false
							},
						]
					}
				]
			}
		],
		order: [
			['displayorder', 'ASC'],
			[ {model: db.Component, as: 'components'}, 'name', 'ASC'],
			[ {model: db.Component, as: 'components'}, {model: db.Animation, as: 'animations'}, 'timelineorder', 'ASC']
		]
		//lock: true,
		//transaction,
		/** /
		lock: {
			level: transaction.LOCK,
			of: db.Container
		},
		/**/
	});
    if (!model) throw 'Container not found';
    return model;
}

async function getHistory() {

	const modelHistories = await db.sequelizeInstance.query(
		"SELECT * FROM `containerHistories`",
		{
			type: db.sequelizeInstance.QueryTypes.SELECT
		}
	);

	return modelHistories;
}

async function getHistoryById(id) {

	const modelHistories = await db.sequelizeInstance.query(
		"SELECT * FROM `containerHistories` WHERE id = ?",
		{
			replacements: [id],
			type: db.sequelizeInstance.QueryTypes.SELECT
		}
	);

	return modelHistories;
}

function basicDetails(model) {
	const { id, name, description, displayorder, duration, clickThroughName, clickThroughURL, status, created, updated, deletedAt, history, version, lastEditedBy, banner, bannerId, components } = model;
	return { id, name, description, displayorder, duration, clickThroughName, clickThroughURL, status, created, updated, deletedAt, history, version, lastEditedBy, banner, bannerId, components };
}
