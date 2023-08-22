const { Goods } = require("../models/models");
const ApiError = require("../error/ApiError");
const { fileUploadCustom, fileDelete } = require("../S3/s3Upload");
const uuid = require("uuid");
const path = require("path");
const fs = require('fs')
const xlsx = require('node-xlsx');

class GoodsController {
    async createGoods(req, res, next) {
        const { name, description, group, price, userId } = req.body;

        let fileLocation;
        try {
            fileLocation = await fileUploadCustom(req.files.image, "goods/"); // вставить
        } catch (e) {
            return next(
                ApiError.internal(`dev_server: ${e.code} + ${e.message}`)
            );
        }

        console.log(fileLocation);

        const device = await Goods.create({
            name,
            description,
            group,
            price,
            image: fileLocation,
            userId
        });

        return res.json(device);
    }



    async fetchGoodsList(req, res, next) {
        let { itemSort, orderSort, limit, page, categoryIt } = req.query;
        page = page || 1;
        limit = limit || 24;
        itemSort = itemSort || "createdAt";
        orderSort = orderSort || "ASC";
        let offset = page * limit - limit;
        let devices;

        try {
            devices = await Goods.findAndCountAll({
                where: { group: categoryIt },
                order: [[itemSort, orderSort]],
                limit,
                offset,
            });
            return res.json(devices);
        } catch (e) {
            return next(
                ApiError.internal(
                    `dev_server: ${e.code} + ${e.message}`
                )
            );
        }
    }   


    async fetchOneGoods(req, res, next) {
        let { id } = req.query;
        try {
            const goods = await Goods.findOne({ where: { id } });
            return res.json(goods);
        } catch (e) {
            return next(
                ApiError.internal(
                    `dev_server: ${e.code} + ${e.message}`
                )
            );
        }
    }

    async deleteOneGoods(req, res, next) {
        let { id } = req.query;
        try {
            const getOneGoods = await Goods.findOne({ where: { id } });
            let mid1 =  getOneGoods.image.split("//")[1].split("/");
            let delObj = {Bucket: mid1[1]+'/'+mid1[2], Key: mid1[3]};
            const goods = await Goods.destroy({ where: { id } });
            if(goods === 1){
                const mid2 = await fileDelete(delObj);
                console.log(mid2)
            }
            return res.json(goods);
        } catch (e) {
            return next(
                ApiError.internal(
                    `dev_server: ${e.code} + ${e.message}`
                )
            );
        }
    }
    async updateGoods(req, res, next) {
        const { name, description, group, price, userId, id } = req.body;

        let fileLocation;
        try {
            const getOneGoods = await Goods.findOne({ where: { id } });
            
            fileLocation = await fileUploadCustom(req.files.image, "goods/"); // вставить
        } catch (e) {
            return next(
                ApiError.internal(`dev_server: ${e.code} + ${e.message}`)
            );
        }
        try{
                const goods = await Goods.update({
                name,
                description,
                group,
                price,
                image: fileLocation,
                userId
            }, {where: {id}});
            console.log(1, typeof goods)

            if(goods[0] === 1){

                let mid1 =  getOneGoods.image.split("//")[1].split("/");
                console.log(mid1)
                let delObj = {Bucket: mid1[1]+'/'+mid1[2], Key: mid1[3]};
                const mid2 = await fileDelete(delObj);
                console.log(mid2)
            }

            return res.json({success: true});
        } catch (error) {
            return next(
                ApiError.internal(
                    `dev_server: ${error.code} + ${error.message}`
                )
            );
    }

        
    }





    async buildXls(req, res, next) {
        try {
            const data = await Goods.findAll()
            let xlsArray = []; 

            for (let i = 0; i < data.length; i++){
                xlsArray[i] = [];

                    xlsArray[i].push(data[i].artikul)
                    xlsArray[i].push(data[i].name)
                    xlsArray[i].push(data[i].price)
                    xlsArray[i].push(data[i].id)

            }

console.log(xlsArray)

            var buffer = xlsx.build([{name: 'mySheetName', data: xlsArray}]);
            console.log(buffer)
            fs.writeFile("test.xlsx", buffer,  "binary", function(err) {
                if(err) {
                    console.log(err);
                } else {
                    console.log("The file was saved!");
                }
            });
            return

            await buffer.mv(path.resolve(__dirname, "..", "static", "qweetr.xls"));
            return res.json({q: 1});
        } catch (e) {
            return next(
                ApiError.badRequest(
                    `Ошибка БД1 (deviceController.allOrdersAdmin): ${e.code} + ${e.message}`
                )
            );
        }
    }





    async parceXls(req, res, next) {
        try {const img = req.files.img
            console.log(req.files.img.name)
            
            const fileName = uuid.v4() + img.name;
            await img.mv(path.resolve(__dirname, "..", "static", fileName));

console.log(`${__dirname}/static/${fileName}`)
            const workSheetsFromFile = xlsx.parse(`${__dirname}/../static/${fileName}`);

            console.log(workSheetsFromFile)
            // await fs.promises.unlink("static/" + fileName);


            return res.json({workSheetsFromFile});
        } catch (e) {
            return next(
                ApiError.badRequest(
                    `Ошибка БД1 (deviceController.allOrdersAdmin): ${e.code} + ${e.message}`
                )
            );
        }
    }
}

module.exports = new GoodsController();
