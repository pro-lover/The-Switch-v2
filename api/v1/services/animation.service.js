const path = require('path');
const db = require(path.join(__dirname, '../shared/db'));
const { Sequelize, Op } = require('sequelize');

module.exports = {
	getAll,
	getById,
	create,
	update,
	updateMeta,
	updateStatus,
	restore,
	delete: _delete
};

async function getAll(reqRole) {

	const paranoidRequest = (reqRole === 'Admin') ? false : true;

	const modelsHistories = await getHistory();

    const models = await db.Animation.findAll({
		paranoid: paranoidRequest,
		order: [
			['timelineorder', 'ASC']
		],
		include:[
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
			{
				model: db.Component,
				required:false,
				include:[
					{
						model: db.ComponentMeta,
						as:'componentmeta',
						required:false
					},
					{
						model: db.Container,
						as:'container',
						required:false,
						include: [
							{
								model: db.Banner,
								as:'banner',
								required:false,
								include:[
									{
										model: db.Templates,
										as:'template',
										required:false,
										paranoid: paranoidRequest,
										include:[
											{
												model: db.Client,
												as:'client',
												paranoid: paranoidRequest,
												required:false
											}
										]
									}
								]
							}
						]
					},
					{
						model: db.ComponentType,
						required:false
					}
				]
			}
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
    const model = await getAnimation(id);
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
	/** /
	if (await db.Animation.findOne({ where: {
		[Op.or]: [{name: params.name}, {description: params.description}]
		} }))
	{
		throw 'Animation already exists. Please provide a unique Name and description.';
	}
	/**/

	if ( await db.Animation.findOne({
				where: {
					name: params.name,
					componentId: params.componentId,
					easingtypeId: params.easingtypeId,
					animationtypeId: params.animationtypeId
				}
			})
		)
	{
		throw 'Animation with name "' + params.name + '" already exists. Please provide a unique Name.';
	}

    const model = new db.Animation(params);
	model.lastEditedBy = editId;
    // save model
    await model.save();

	// get the meta data keys
	let componentsAnimationsMeta = [];
	let metakeys = Object.keys(params.animationmeta);
	metakeys.forEach(meta => {

		componentsAnimationsMeta.push({
			name: meta,
			value: params.animationmeta[meta],
			// Added Component ID
			animationId: model.id,
			lastEditedBy: editId
		});
	});

	await db.AnimationMeta.bulkCreate(
		componentsAnimationsMeta,
		{
			validate: false
		}
	);

	return basicDetails( await getAnimation(model.id) );
}

async function update(id, params, editId) {
    const model = await getAnimation(id);

	if ( await db.Animation.findOne({
				where: {
					name: params.name,
					componentId: params.componentId,
					easingtypeId: params.easingtypeId,
					animationtypeId: params.animationtypeId
				}
			})
		)
	{
		if (params.name && model.name == params.name && model.description == params.description ) {
			// name and description haven't changed
		} else {
			throw 'Animation with name "' + params.name + '" already exists. Please provide a unique Name.';
		}

	}

    // copy params to model and save
    Object.assign(model, params);
    model.updated = Date.now();
	model.lastEditedBy = editId;
    await model.save();

    return basicDetails(model);
}

async function updateMeta(id, params, editId) {

	const model = await getAnimation(id);
	/*
	// validate (if name/shortname was changed)
	if (params.name && model.name == params.name && model.description == params.description ) {
		throw 'Component hasn\'t been updated.';
	}
	// validate (if name/shortname is unique in db)
	if ( params.name && (model.name !== params.name) && await db.Component.findOne({ where: { name: params.name } })) {
		throw 'Component already exists.';
	}
	/**/

	model.updated = Date.now();
	model.lastEditedBy = editId;
	await model.save();

	const animationMeta = await db.AnimationMeta.findAll({
		where: {animationId: id}
	});

	animationMeta.forEach( async (prime) => {

		if( prime.name === 'positionX' && params.animationmeta.positionX ) {

			prime.value = params.animationmeta.positionX;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}
		if( prime.name === 'positionY' && params.animationmeta.positionY ) {

			prime.value = params.animationmeta.positionY;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}

		if( prime.name === 'startTime' && params.animationmeta.startTime ) {

			prime.value = params.animationmeta.startTime;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}

		if( prime.name === 'opacity' && params.animationmeta.opacity ) {

			prime.value = params.animationmeta.opacity;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;

		}

		if( prime.name === 'scaleX' && params.animationmeta.scaleX ) {

			prime.value = params.animationmeta.scaleX;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}

		if( prime.name === 'scaleY' && params.animationmeta.scaleY ) {

			prime.value = params.animationmeta.scaleY;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}

		if( prime.name === 'rotation' && params.animationmeta.rotation ) {

			prime.value = params.animationmeta.rotation;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}

		if( prime.name === 'duration' && params.animationmeta.duration ) {

			prime.value = params.animationmeta.duration;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}

		await prime.save();
	});

	//return model;

    return basicDetails( await getAnimation(id) );
}

async function updateStatus(id, params, editId) {
	const model = await getAnimation(id);

	model.status = params.status;
	model.updated = Date.now();
	model.lastEditedBy = editId;

	await model.save();

	return basicDetails(model);
}

async function _delete(id, editId) {
    const model = await getAnimation(id);
	await model.update({updated: Date.now(), lastEditedBy: editId, status: false });
    await model.destroy();

	getAnimationMetaByAnimationId(id).then((animationsMeta) =>{

		animationsMeta.forEach( async (meta) =>{

			await meta.update({updated: Date.now(), lastEditedBy: editId, status: false });
			await meta.destroy();

		});

		return basicDetails(model);

	});
}

async function restore(id, editId) {
	const model = await getAnimation(id);
	await model.restore();
	await model.update({lastEditedBy: editId, status: true });

	getAnimationMetaByAnimationId(id).then((animationsMeta) =>{

		animationsMeta.forEach( async (meta) =>{
			await meta.restore();
			await meta.update({updated: Date.now(), lastEditedBy: editId, status: true });

		});

		return basicDetails(model);

	});
}

// helper functions

async function getAnimation(id) {
	//const transaction = await db.sequelizeInstance.transaction({isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED});
    const model = await db.Animation.findByPk(id, {
		paranoid: false,
		include:[
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
			{
				model: db.Component,
				required:false,
				include:[
					{
						model: db.ComponentMeta,
						as:'componentmeta',
						required:false
					},
					{
						model: db.Container,
						as:'container',
						required:false,
						include: [
							{
								model: db.Banner,
								as:'banner',
								required:false,
								include:[
									{
										model: db.Templates,
										as:'template',
										required:false,
										paranoid: false,
										include:[
											{
												model: db.Client,
												as:'client',
												paranoid: false,
												required:false
											}
										]
									}
								]
							}
						]
					},
					{
						model: db.ComponentType,
						required:false
					}
				]
			}
		]
		//lock: true,
		//transaction,
		/** /
		lock: {
			level: transaction.LOCK,
			of: db.Animation
		},
		/**/
	});
    if (!model) throw 'Animation not found';
    return model;
}

async function getAnimationMetaByAnimationId(id) {

	const animationMeta = await db.AnimationMeta.findAll({
		paranoid: false,
		where: {animationId: id}
	});

	return animationMeta;
}

async function getHistory() {

	const modelHistories = await db.sequelizeInstance.query(
		"SELECT * FROM `animationHistories`",
		{
			type: db.sequelizeInstance.QueryTypes.SELECT
		}
	);

	return modelHistories;
}

async function getHistoryById(id) {

	const modelHistories = await db.sequelizeInstance.query(
		"SELECT * FROM `animationHistories` WHERE id = ?",
		{
			replacements: [id],
			type: db.sequelizeInstance.QueryTypes.SELECT
		}
	);

	return modelHistories;
}

function basicDetails(model) {
	const { id, name, description, timelineorder, animationloop, status, created, updated, deletedAt, history, version, lastEditedBy, animationmeta, animationtypeId, animationtype, easingtypeId, easingtype, component, componentId } = model;
	return { id, name, description, timelineorder, animationloop, status, created, updated, deletedAt, history, version, lastEditedBy, animationmeta, animationtypeId, animationtype, easingtypeId, easingtype, component, componentId };
}
