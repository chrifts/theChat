'use strict';
module.exports = (sequelize, DataTypes) => {
  const Relation = sequelize.define('Relation', {
    user_id: DataTypes.STRING,
    contact_id: DataTypes.STRING,
    onMainView: DataTypes.STRING,
  }, {});
  Relation.associate = function(models) {
    // associations can be defined here
  };
  return Relation;
};