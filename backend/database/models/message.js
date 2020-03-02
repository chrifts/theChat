'use strict';
module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    message: DataTypes.STRING,
    readed: DataTypes.STRING,
    image: DataTypes.STRING,
    file: DataTypes.STRING,
    user_transmitter: DataTypes.STRING,
    user_receiver: DataTypes.STRING,
    channel: DataTypes.STRING
  }, {});
  Message.associate = function(models) {
    // associations can be defined here
  };
  return Message;
};