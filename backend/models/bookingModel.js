module.exports = (sequelize, Sequelize) => {
  return sequelize.define("booking", {
    name: {
      type: Sequelize.STRING,
    },
    email: {
      type: Sequelize.STRING,
    },
    service: {
      type: Sequelize.STRING,
    },
    serviceDate: {
      type: Sequelize.DATEONLY,
    },
    specialRequest: {
      type: Sequelize.TEXT,
    },
  });
};
