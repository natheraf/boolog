const dbConfig = require("../config/db.config");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.db, dbConfig.user, dbConfig.password, {
  host: process.argv[2] === "dev" ? "localhost" : dbConfig.host,
  dialect: dbConfig.dialect,
  dialectOptions:
    process.argv[2] === "dev"
      ? {}
      : {
          ssl: {
            require: true,
            rejectUnauthorized: false, // https://stackoverflow.com/a/61350416
          },
        },
  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle,
  },
});

sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((error) => {
    console.error("Unable to connect to the database: ", error);
  });

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require("./user.model")(sequelize, Sequelize);
db.role = require("./role.model")(sequelize, Sequelize);

db.role.hasMany(db.user);

db.ROLES = ["super_admin", "admin", "user"];

module.exports = db;
