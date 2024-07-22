module.exports = (drop) => {
  const db = require("./models");
  const { createSuperAdmin } = require("./controller/auth.controller");

  if (drop) {
    // In development, you may need to drop existing tables and re-sync database. Just use force: true as following code:
    db.sequelize.sync({ force: true }).then(() => {
      console.log("Drop and re-sync db.");
      initialize();
    });
  } else {
    db.sequelize
      .sync()
      .then(() => {
        console.log("DB sequelize synced successfully!");
      })
      .catch((error) => {
        console.error("DB sequelize synced NOT successfully: ", error);
      });
  }

  function initialize() {
    db.ROLES.forEach((role, index) =>
      db.role.create({
        id: index,
        name: role,
      })
    );

    createSuperAdmin();
  }
};
