const sequelize = require('../db')
const {DataTypes} = require('sequelize')



const Device = sequelize.define('device', {
    // Данные товара
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}, 
    name: {type: DataTypes.STRING, allowNull: false}, // Название товара
    feature: {type: DataTypes.STRING, allowNull: false}, // Хар-ки заказа (Все параметры в тексте + описание)
    img: {type: DataTypes.STRING, allowNull: false}, // Ссылка на файл 
    price: {type: DataTypes.STRING, allowNull: false}, // Стоимость товара
    // Данные клиента
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
    status_email: {type: DataTypes.BOOLEAN, defaultValue: false}, // Статус подтверждения почты - на почту приходит пароль. 

})

const Review = sequelize.define('review', {
    // Данные товара
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}, 
    theme: {type: DataTypes.STRING, allowNull: false}, // Название товара
    description: {type: DataTypes.TEXT, allowNull: false},
}) 

const Goods = sequelize.define('goods', {
    // Данные товара
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}, 
    name: {type: DataTypes.STRING, allowNull: false}, // Название товара
    description: {type: DataTypes.TEXT, allowNull: false}, // Хар-ки заказа (Все параметры в тексте + описание)
    image: {type: DataTypes.STRING, allowNull: false}, // Ссылка на файл 
    price: {type: DataTypes.STRING, allowNull: false}, // Новая цена
    artikul: {type: DataTypes.STRING}, // артикул товара
    group: {type: DataTypes.STRING, allowNull: false}, // группа товара

})

const Items = sequelize.define('items', {
    id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true}, // 
}) 


Items.hasMany(Device)
Device.belongsTo(Items)

User.hasMany(Device)
Device.belongsTo(User)

User.hasMany(Review)
Review.belongsTo(User)

User.hasMany(Goods)
Goods.belongsTo(User)

Goods.hasMany(Device)
Device.belongsTo(Goods)

module.exports = {
    User,
    Device, 
    Review, 
    Goods, 
    Items,
}





