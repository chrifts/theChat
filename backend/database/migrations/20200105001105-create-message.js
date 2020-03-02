'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Messages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      message: {
        type: Sequelize.STRING
      },
      readed: {
        type: Sequelize.STRING
      },
      image: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      file: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null
      },
      user_transmitter: {
        type: Sequelize.STRING
      },
      user_receiver: {
        type: Sequelize.STRING
      },
      channel: {
        type: Sequelize.STRING
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
    return queryInterface.dropTable('Messages');
  }
};