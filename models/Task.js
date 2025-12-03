const { Sequelize, DataTypes } = require("sequelize");
require("pg"); // ensures pg driver is included

const sequelize = new Sequelize(
    process.env.PG_DATABASE,
    process.env.PG_USERNAME,
    process.env.PG_PASSWORD,
    {
        host: process.env.PG_HOST,
        port: process.env.PG_PORT,
        dialect: "postgres",
        logging: false,
        dialectOptions: {
            ssl: false  // disable SSL for local Postgres
        }
    }
);

const Task = sequelize.define("Task", {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    dueDate: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: "pending"
    },
    userId: {
        type: DataTypes.STRING,   // Mongo user _id as string
        allowNull: false
    }
});

module.exports = { sequelize, Task };
