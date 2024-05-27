const { DataTypes } = require('sequelize');

module.exports = model;

function model(sequelize) {
    const attributes = {
		email: { type: DataTypes.STRING, allowNull: false },
		passwordHash: { type: DataTypes.STRING, allowNull: true },
		title: { type: DataTypes.STRING, allowNull: false },
		firstName: { type: DataTypes.STRING, allowNull: false },
		lastName: { type: DataTypes.STRING, allowNull: false },
		acceptTerms: { type: DataTypes.BOOLEAN },
		role: { type: DataTypes.STRING, allowNull: false },
		status: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
		verificationToken: { type: DataTypes.STRING },
		verified: { type: DataTypes.DATE },
		resetToken: { type: DataTypes.STRING },
		resetTokenExpires: { type: DataTypes.DATE },
		passwordReset: { type: DataTypes.DATE },
		//created: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
		//updated: { type: DataTypes.DATE },
		isVerified: {
			type: DataTypes.VIRTUAL,
			get() { return !!(this.verified || this.passwordReset); }
		},
		lastEditedBy: { type: DataTypes.INTEGER, allowNull: true }
    };

    const options = {
		//

        // disable default timestamp fields (createdAt and updatedAt)
        timestamps: true,
		createdAt: 'created',
		updatedAt: 'updated',
		// don't delete database entries but set the newly added attribute deletedAt
		// to the current date (when deletion was done). paranoid will only work if
		// timestamps are enabled
		paranoid: true,
		// Enable optimistic locking.  When enabled, sequelize will add a version count attribute
  		// to the model and throw an OptimisticLockingError error when stale instances are saved.
		// Set to true or a string with the attribute name you want to use to enable.
		version: true,
        defaultScope: {
            // exclude password hash by default
            attributes: { exclude: ['passwordHash'] }
        },
        scopes: {
            // include hash with this scope
            withHash: { attributes: {}, }
        }
    };

    return sequelize.define('account', attributes, options);
}
