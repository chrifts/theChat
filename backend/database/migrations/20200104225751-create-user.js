'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      firstName: {
        allowNull: false,
        type: Sequelize.STRING
      },
      lastName: {
        allowNull: false,
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      firstTime: {
        type: Sequelize.STRING,
        allowNull: false
      },
      prefix: {
        type: Sequelize.STRING,
        allowNull: false
      },
      localCode: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tel: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      digits: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      verifyCode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      deviceId: {
        type: Sequelize.STRING,
        allowNull: false
      },
      expoPushToken: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Users');
  }
};