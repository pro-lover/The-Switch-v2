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
	updateSmartStatus,
	restore,
	delete: _delete
};

async function getAll(reqRole) {

	const paranoidRequest = (reqRole === 'Admin') ? false : true;

	const modelsHistories = await getHistory();

    const models = await db.Component.findAll({
		paranoid: paranoidRequest,
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
		],
		order: [
			['name', 'ASC'],
			[ {model: db.Animation, as: 'animations'}, 'timelineorder', 'ASC']
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
    const model = await getComponent(id);
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
	if (	await db.Component.findOne({
				where: {
					[Op.or]: [
						{name: params.name}
						//{description: params.description}
					]
				}
			})
		)
	{
		throw 'Component already exists. Please provide a unique Name and description.';
	}
	/**/

    const model = new db.Component(params);
	model.lastEditedBy = editId;
    // save model
    await model.save();

	// get the meta data keys
	let templateBannersContainersComponentsMeta = [];
	let metakeys = Object.keys(params.componentmeta);
	metakeys.forEach(meta => {

		if( meta === 'dataFileName' || meta === 'dataFilePath' ) {
			// Dont do anything
		}
		else if( meta === 'dataFile' ) {
			templateBannersContainersComponentsMeta.push({
				name: 'path',
				value: params.componentmeta['dataFilePath'],
				// Added Component ID
				componentId: model.id,
				lastEditedBy: editId
			});
		} else {
			templateBannersContainersComponentsMeta.push({
				name: meta,
				value: params.componentmeta[meta],
				// Added Component ID
				componentId: model.id,
				lastEditedBy: editId
			});
		}
	});

	await db.ComponentMeta.bulkCreate(
		templateBannersContainersComponentsMeta,
		{
			validate: false
		}
	);

    //return basicDetails(model);

	return basicDetails( await getComponent(model.id) );
}

async function update(id, params, editId) {

	const model = await getComponent(id);
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
	if ( await db.Component.findOne({
				where: {
					name: params.name,
					containerId: params.containerId,
					componenttypeId: params.componenttypeId
				}
			})
		)
	{
		throw 'Component with name "' + params.name + '" already exists.';
	}

	model.name = params.name;
	model.description = params.description;
	model.smart = params.smart;
	model.status = params.status;

	model.updated = Date.now();
	model.lastEditedBy = editId;
	await model.save();

    return basicDetails( await getComponent(id) );
}

async function updateMeta(id, params, editId) {

	const model = await getComponent(id);
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

	const componentMeta = await db.ComponentMeta.findAll({
		where: {componentId: id},
	});

	componentMeta.forEach( async (prime) => {

		if( prime.name === 'positionX' ) {
			//console.log('componentMeta:', prime.name, params.positionX);
			prime.value = params.componentmeta.positionX;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}
		if( prime.name === 'positionY' ) {
			//console.log('componentMeta:', prime.name, params.positionY);
			prime.value = params.componentmeta.positionY;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}

		if( prime.name === 'width' ) {

			prime.value = params.componentmeta.width;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}

		if( prime.name === 'height' ) {

			prime.value = params.componentmeta.height;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;

		}

		if( prime.name === 'zIndex' ) {

			prime.value = params.componentmeta.zIndex;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}

		if( prime.name === 'path' && params.componentmeta.dataFilePath ) {

			prime.value = params.componentmeta.dataFilePath;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}

		if( prime.name === 'shapeColour' && params.componentmeta.shapeColour ) {

			prime.value = params.componentmeta.shapeColour;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}

		if( prime.name === 'fontColour' && params.componentmeta.fontColour ) {

			prime.value = params.componentmeta.fontColour;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}

		if( prime.name === 'fontFamilyId' && params.componentmeta.fontFamilyId ) {

			prime.value = params.componentmeta.fontFamilyId;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}

		if( prime.name === 'fontFamily' && params.componentmeta.fontFamily ) {

			prime.value = params.componentmeta.fontFamily;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}

		if( prime.name === 'fontValue' && params.componentmeta.fontValue ) {

			prime.value = params.componentmeta.fontValue;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}

		if( prime.name === 'fontSize' && params.componentmeta.fontSize ) {
			prime.value = params.componentmeta.fontSize;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}

		if( prime.name === 'fontLineHeight' && params.componentmeta.fontLineHeight ) {
			prime.value = params.componentmeta.fontLineHeight;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}

		if( prime.name === 'fontWeight' && params.componentmeta.fontWeight ) {
			prime.value = params.componentmeta.fontWeight;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}

		if( prime.name === 'fontStyle' && params.componentmeta.fontStyle ) {
			prime.value = params.componentmeta.fontStyle;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}

		if( prime.name === 'textAlign' && params.componentmeta.textAlign ) {
			prime.value = params.componentmeta.textAlign;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}


		if( prime.name === 'shapeRadiusTL' && params.componentmeta.shapeRadiusTL ) {
			prime.value = params.componentmeta.shapeRadiusTL;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}

		if( prime.name === 'shapeRadiusTR' && params.componentmeta.shapeRadiusTR ) {
			prime.value = params.componentmeta.shapeRadiusTR;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}

		if( prime.name === 'shapeRadiusBR' && params.componentmeta.shapeRadiusBR ) {
			prime.value = params.componentmeta.shapeRadiusBR;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}

		if( prime.name === 'shapeRadiusBL' && params.componentmeta.shapeRadiusBL ) {
			prime.value = params.componentmeta.shapeRadiusBL;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}

		if( prime.name === 'shapePaddingTop' && params.componentmeta.shapePaddingTop ) {
			prime.value = params.componentmeta.shapePaddingTop;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}

		if( prime.name === 'shapePaddingRight' && params.componentmeta.shapePaddingRight ) {
			prime.value = params.componentmeta.shapePaddingRight;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}

		if( prime.name === 'shapePaddingBottom' && params.componentmeta.shapePaddingBottom ) {
			prime.value = params.componentmeta.shapePaddingBottom;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}

		if( prime.name === 'shapePaddingLeft' && params.componentmeta.shapePaddingLeft ) {
			prime.value = params.componentmeta.shapePaddingLeft;
			prime.updated = Date.now();
			prime.lastEditedBy = editId;
		}

		await prime.save();
	});

	//return model;

    return basicDetails( await getComponent(id) );
}

async function updateStatus(id, params, editId) {
	const model = await getComponent(id);

	model.status = params.status;
	model.updated = Date.now();
	model.lastEditedBy = editId;

	await model.save();

	return basicDetails(model);
}

async function updateSmartStatus(id, params, editId) {
	const model = await getComponent(id);

	model.smart = params.status;
	model.updated = Date.now();
	model.lastEditedBy = editId;

	await model.save();

	return basicDetails(model);
}

async function _delete(id, editId) {
    const model = await getComponent(id);
	await model.update({updated: Date.now(), lastEditedBy: editId, status: false });
    await model.destroy();

	getComponentsMetaByComponentId(id).then((componentsMeta) =>{

		componentsMeta.forEach( async (meta) =>{

			await meta.update({updated: Date.now(), lastEditedBy: editId, status: false });
			await meta.destroy();

		});

		return basicDetails(model);

	});
}

async function restore(id, editId) {
	const model = await getComponent(id);
	await model.restore();
	await model.update({lastEditedBy: editId, status: true });

	// 4)
	getComponentsMetaByComponentId(id).then((componentsMeta) =>{

		componentsMeta.forEach( async (meta) =>{
			await meta.restore();
			await meta.update({updated: Date.now(), lastEditedBy: editId, status: true });

		});

		return basicDetails(model);

	});

}

// helper functions

async function getComponent(id) {
	//const transaction = await db.sequelizeInstance.transaction({isolationLevel: Sequelize.Transaction.ISOLATION_LEVELS.READ_COMMITTED});
    const model = await db.Component.findByPk(id, {
		paranoid: false,
		/**/
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
		],
		order: [
			['name', 'ASC'],
			[ {model: db.Animation, as: 'animations'}, 'timelineorder', 'ASC']
		]
		/**/
		//lock: true,
		//transaction,
		/** /
		lock: {
			level: transaction.LOCK,
			of: db.Component
		},
		/**/
	});
    if (!model) throw 'Component not found';
    return model;
}

async function getComponentsMetaByComponentId(id) {

	const componentMeta = await db.ComponentMeta.findAll({
		paranoid: false,
		where: {componentId: id}
	});

	return componentMeta;
}

async function getHistory() {

	const modelHistories = await db.sequelizeInstance.query(
		"SELECT * FROM `componentHistories`",
		{
			type: db.sequelizeInstance.QueryTypes.SELECT
		}
	);

	return modelHistories;
}

async function getHistoryById(id) {

	const modelHistories = await db.sequelizeInstance.query(
		"SELECT * FROM `componentHistories` WHERE id = ?",
		{
			replacements: [id],
			type: db.sequelizeInstance.QueryTypes.SELECT
		}
	);

	return modelHistories;
}

function basicDetails(model) {
	const { id, name, description, status, smart, created, updated, deletedAt, history, version, lastEditedBy, componentmeta, componentmetaId, container, containerId, componenttype, componenttypeId, animations } = model;
	return { id, name, description, status, smart, created, updated, deletedAt, history, version, lastEditedBy, componentmeta, componentmetaId, container, containerId, componenttype, componenttypeId, animations };
}
