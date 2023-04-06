// users schema
module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define('users', {
      id: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4
      },
      username: DataTypes.STRING,
      password: DataTypes.STRING,
	  fullname: DataTypes.STRING,
      last_login: DataTypes.DATE
  },
  {}
  );
  
  return users;
}