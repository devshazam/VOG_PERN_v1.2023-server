const sequelize = require('../db')
const {DataTypes} = require('sequelize')



const Device = sequelize.define('device', {
    // Данные товара
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}, 
    name: {type: DataTypes.STRING, allowNull: false}, // Название товара
    feature: {type: DataTypes.STRING, allowNull: false}, // Хар-ки заказа (Все параметры в тексте + описание)
    img: {type: DataTypes.STRING, allowNull: false}, // Ссылка на файл 

    // Данные клиента
    userDescription: {type: DataTypes.STRING, allowNull: false}, // Имя клиента 
    descriptionText: {type: DataTypes.TEXT, defaultValue: 'без описания'},
    // Готовность
    status_done: {type: DataTypes.BOOLEAN, defaultValue: false}, // Статус готовности - этот статус работники самостоятельно применяют при обработке заказа
    status_pay: {type: DataTypes.BOOLEAN, defaultValue: false}, // Статус оплаченности - статус заноситься при обратной переадресации на сайт после оплаты на стороне платежной системы


})

const User = sequelize.define('user', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}, 
    name: {type: DataTypes.STRING, allowNull: false}, // Имя клиента 
    phone: {type: DataTypes.STRING, allowNull: false}, // Телефон клиента 
    email: {type: DataTypes.STRING, allowNull: false}, // Електронный адрес
    address: {type: DataTypes.STRING, defaultValue: null}, // Адрес
    password: {type: DataTypes.STRING, allowNull: false}, // Пароль 
    role: {type: DataTypes.STRING, defaultValue: "USER"}, // Роль пользователя (USER/ADMIN)
    
    // Верификация
    status_email: {type: DataTypes.BOOLEAN, defaultValue: false}, // Статус подтверждения почты - на почту приходит пароль. 

})



User.hasMany(Device)
Device.belongsTo(User)


module.exports = {
    User,
    Device
}





