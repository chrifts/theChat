'use strict';
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    firstTime: DataTypes.STRING,
    prefix: DataTypes.STRING,
    localCode: DataTypes.STRING,
    tel: DataTypes.STRING,
    digits: DataTypes.STRING,
    verifyCode: DataTypes.STRING,
    deviceId: DataTypes.STRING,
    expoPushToken: DataTypes.STRING,
  }, {});
  User.associate = function(models) {
    // associations can be defined here
  };
  return User;
};