const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
	const attributes = {
		name: { type: DataTypes.STRING, allowNull: false },
		description: { type: DataTypes.STRING, allowNull: false },
		displayorder: { type: DataTypes.INTEGER, allowNull: true, defaultValue: 1 },
		duration: { type: DataTypes.FLOAT, allowNull: true, defaultValue: 15 },
		clickThroughName: { type: DataTypes.STRING, allowNull: true },
		clickThroughURL: { type: DataTypes.STRING, allowNull: true },
		status: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
		lastEditedBy: { type: DataTypes.INTEGER, allowNull: false }
	};

	const options = {
		// disable default timestamp fields (createdAt and updatedAt)
		timestamps: true,
		createdAt: 'created',
		updatedAt: 'updated',
		paranoid: true,
		// Enable optimistic locking.  When enabled, sequelize will add a version count attribute
  		// to the model and throw an OptimisticLockingError error when stale instances are saved.
		// Set to true or a string with the attribute name you want to use to enable.
		version: true,
	};

	return sequelize.define('container', attributes, options);
}
