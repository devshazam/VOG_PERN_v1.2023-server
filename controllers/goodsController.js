const { Goods, Orders } = require("../models/models");
const ApiError = require("../error/ApiError");
const { fileUploadCustom, fileDelete, xlsxUploadCustom } = require("../S3/s3Upload");
const uuid = require("uuid");
const path = require("path");
const { appendFiles } = require("../error-log/LogHandling");

const fs = require('fs')
const xlsx = require('node-xlsx');
const sequelize = require('../db')


class GoodsController {

    // POST(_1_): `api/goods/` + `/`
    async createGoods(req, res, next) {
        const { name, description, group, price, userId, artikul, priceImg } = req.body;

        try {
            const fileLocation = await fileUploadCustom(req.files.image, "goods/"); // вставить
            console.log(fileLocation);
            const goods = await Goods.create({
                name,
                description,
                group,
                price,
                image: fileLocation,
                userId, 
                artikul,
                price_img: priceImg
            });
    
            return res.json(goods);
        } catch (e) {
            appendFiles(`\n610: ${e.message}`)
            return next(
                ApiError.internal(`610: ${e.message}`)
            );
        }


    }


    // GET(_2_): `api/goods/` + `/fetch-list`
    async fetchGoodsList(req, res, next) {
        let { itemSort, orderSort, limit, page, categoryIt } = req.query;
        page = +page || 1;
        limit = +limit || 24;
        itemSort = itemSort || "createdAt";
        orderSort = orderSort || "ASC";
        let offset = page * limit - limit;

        try {
            const goods = await Goods.findAndCountAll({
                where: { group: categoryIt },
                order: [[itemSort, orderSort]],
                limit,
                offset,
            });
            return res.json(goods);
        } catch (e) {
            appendFiles(`\n611: ${e.message}`)
            return next(
                ApiError.internal(
                    `611: ${e.message}`
                )
            );
        }
    }   

    // GET(_3_): `api/goods/` + `/fetch-one`
    async fetchOneGoods(req, res, next) {
        let { goodsId, barcode } = req.body;
        try {
            if(goodsId){
                const goods = await Goods.findOne({ where: { id: goodsId } });
                return res.json(goods);
            }else{
                const goods = await Goods.findOne({ where: { barcode } });
                return res.json(goods);
            }
            
        } catch (e) {
            appendFiles(`\n612: ${e.message}`)
            return next(
                ApiError.internal(
                    `612: ${e.message}`
                )
            );
        }
    }

    // GET(_4_): `api/goods/` + `/delete-one`
    async deleteOneGoods(req, res, next) {
        let { id } = req.query;
        try {
            const getOneGoods = await Goods.findOne({ where: { id } });
            let mid1 =  getOneGoods.image.split("//")[1].split("/");
            let delObj = {Bucket: mid1[1]+'/'+mid1[2], Key: mid1[3]};
            const goods = await Goods.destroy({ where: { id } });
            if(goods === 1){
                const mid2 = await fileDelete(delObj);
                // console.log(mid2)
            }
            return res.json({goods});
        } catch (e) {
            appendFiles(`\n613: ${e.message}`)
            return next(
                ApiError.internal(
                    `613: ${e.message}`
                )
            );
        }
    }

    // POST(_5_): `api/goods/` + `/update-one`
    async updateGoods(req, res, next) {
        const { name, description, group, price, userId, id, artikul } = req.body;

        try {
            const getOneGoods = await Goods.findOne({ where: { id } });
            const fileLocation = await fileUploadCustom(req.files.image, "goods/"); // вставить
            const goods = await Goods.update({
                name,
                description,
                group,
                price,
                image: fileLocation,
                userId, 
                artikul
            }, {where: {id}});

            if(goods[0] === 1){
                let mid1 =  getOneGoods.image.split("//")[1].split("/");
                let delObj = {Bucket: mid1[1]+'/'+mid1[2], Key: mid1[3]};
                const mid2 = await fileDelete(delObj);
            }

            return res.json({success: true});
        }  catch (error) {
            appendFiles(`\n614: ${e.message}`)
            return next(
                ApiError.internal(
                    `614: ${error.message}`
                )
            );
        }
    }



    // GET(_6_): `api/goods/` + `/fetch-xsl-file`
    async buildXls(req, res, next) {
        try {
            const data = await Goods.findAll()
            let xlsArray = []; 

            for (let i = 0; i < data.length; i++){
                xlsArray[i] = [];
                    xlsArray[i].push(data[i].name)
                    xlsArray[i].push(data[i].artikul)
                    xlsArray[i].push(data[i].price)
                    xlsArray[i].push(data[i].id)
            }
            var buffer = xlsx.build([{name: 'GoodsList', data: xlsArray}]);
            const fileLocation = await xlsxUploadCustom(buffer);
            return res.json({fileLocation});
        } catch (e) {
            appendFiles(`\n615: ${e.message}`)
            return next(
                ApiError.badRequest(
                    `615: ${e.message}`
                )
            );
        }
    }




// STOPED 
    // POST(_7_): `api/goods/` + `/parce-xls`
    async parceXls(req, res, next) {
        try {
            const img = req.files.wsx;
            const fileName = uuid.v4() + img.name;
            await img.mv(path.resolve(__dirname, "..", "static", fileName));

console.log(`${__dirname}/static/${fileName}`)
            const workSheetsFromFile = xlsx.parse(`${__dirname}/../static/${fileName}`);

            console.log(workSheetsFromFile)
            // await fs.promises.unlink("static/" + fileName);


            return res.json({workSheetsFromFile});
        } catch (e) {
            appendFiles(`\n616: ${e.message}`)
            return next(
                ApiError.badRequest(
                    `616: ${e.message}`
                )
            );
        }
    }


    async fetchListOfGoods(req, res, next) {
        let { itemSort, orderSort, limit, page, filter, barcode } = req.body;
        page = page || 1;
        limit = limit || 10;
        itemSort = itemSort || "createdAt";
        orderSort = orderSort || "ASC";
        let offset = page * limit - limit;
        
        try {
            if(barcode){
                const midGoods = await Goods.findAndCountAll({
                    where: { barcode }
                });
                return res.json(midGoods);
            }else{
                const midGoods = await Goods.findAndCountAll({
                    where: { group: filter },
                    order: [[itemSort, orderSort]],
                    limit,
                    offset,
                });
                return res.json(midGoods);
            }
            
        } catch (e) {
            appendFiles(`\n638: ${e.message}`);
            return next(ApiError.internal(`638: ${e.message}`));
        }

    }


    async ChangeGoodsParams(req, res, next) {
        let { goodsId, name, description, group, price, priceImg, summa, artikul } = req.body;

        try {
            let midGoods = await Goods.findOne({ where: { id: goodsId } });
            if(!midGoods) return res.status(506).json({message: "Товар не найден!"});

            name = name || midGoods.name;
            description = description || midGoods.description;
            group = group || midGoods.group;
            price = price || midGoods.price;
            priceImg = priceImg || midGoods.price_img;
            summa = summa || midGoods.summa;
            artikul = artikul || midGoods.artikul;

            midGoods.set({
                name,
                description,
                group,
                price,
                price_img: priceImg,
                summa, 
                artikul
              });
              
            const goods = await midGoods.save();
            console.log(goods)
 
            return res.json(goods);
        } catch (e) {
            appendFiles(`\n612: ${e.message}`)
            return next(
                ApiError.internal(
                    `612: ${e.message}`
                )
            );
        }
    }

    async increasePriceByProcent(req, res, next) {
        let { procent, group } = req.body;
        let transaction;

        try {
            transaction = await sequelize.transaction();
            const data = await Goods.findAll({where: {group},
                attributes: ['id', 'price', 'price_img']
              })
            //   console.log(data)
          for(let item of data){
            await Goods.update({price: Math.ceil(item.price * ( 1 + procent / 100)), price_img: Math.ceil(item.price_img * ( 1 + procent / 100))}, {where: {id: item.id}, transaction})
          }
            await transaction.commit();
            return res.json({message: 'success!'});
        } catch (e) {
            
            appendFiles(`\n615: ${e.message}`)
            if(transaction) {
                await transaction.rollback();
             }
            return next(
                ApiError.badRequest(
                    `615: ${e.message}`
                )
            );
        }
    }


    
}

module.exports = new GoodsController();
