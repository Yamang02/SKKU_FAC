import { DataTypes } from 'sequelize';
import { sequelize } from '../../config/database.js';

const Test = sequelize.define('Test', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    value: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    timestamps: true,
    tableName: 'tests'
});

export default Test;
