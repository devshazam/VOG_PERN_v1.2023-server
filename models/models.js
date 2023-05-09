const sequelize = require('../db')
const {DataTypes} = require('sequelize')



const Device = sequelize.define('device', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    name: {type: DataTypes.STRING, unique: true, allowNull: false},
    price: {type: DataTypes.INTEGER, allowNull: false},
    old_price: {type: DataTypes.INTEGER, allowNull: false},
    sale: {type: DataTypes.INTEGER, allowNull: false},
    category: {type: DataTypes.STRING, allowNull: false},
    img: {type: DataTypes.STRING, allowNull: false},
    
})

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
    email: {type: DataTypes.STRING, unique: true,},
    password: {type: DataTypes.STRING},
    role: {type: DataTypes.STRING, defaultValue: "USER"},
})



User.hasMany(Device)
Device.belongsTo(User)


module.exports = {
    User,
    Device
}





