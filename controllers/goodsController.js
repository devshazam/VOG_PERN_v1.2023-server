const { Goods, Orders, Price, Jsona } = require("../models/models");
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
        const { name, description, group, price, userId, artikul, priceImg, barcode } = req.body;

        try {
            const fileLocation = await fileUploadCustom(req.files.image, "goods/"); // вставить

            const goods = await Goods.create({
                name,
                description,
                group,
                price,
                image: fileLocation,
                userId, 
                artikul,
                price_img: priceImg,
                barcode
            });
    
            return res.json(goods);
        } catch (e) {
            appendFiles(`\n610: ${e.message}`)
            return next(
                ApiError.internal(`610: ${e.message}`)
            );
        }


    }



    

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


    
// updateGoods
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





//     async parceXls(req, res, next) {
//         try {
//             const img = req.files.wsx;
//             const fileName = uuid.v4() + img.name;
//             await img.mv(path.resolve(__dirname, "..", "static", fileName));

// console.log(`${__dirname}/static/${fileName}`)
//             const workSheetsFromFile = xlsx.parse(`${__dirname}/../static/${fileName}`);

//             console.log(workSheetsFromFile)
//             // await fs.promises.unlink("static/" + fileName);


//             return res.json({workSheetsFromFile});
//         } catch (e) {
//             appendFiles(`\n616: ${e.message}`)
//             return next(
//                 ApiError.badRequest(
//                     `616: ${e.message}`
//                 )
//             );
//         }
//     }


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


// Есть еще метод для замены параметров С КАРТИНКОЙ -> updateGoods
    async ChangeGoodsParams(req, res, next) {
        let { goodsId, name, description, group, price, priceImg, summa, artikul, barcode } = req.body;

        try {
            let midGoods = await Goods.findByPk(goodsId);
            if(!midGoods) return res.status(432).json({message: "Товар не найден!"});

            name = name || midGoods.name;
            description = description || midGoods.description;
            group = group || midGoods.group;
            price = price || midGoods.price;
            priceImg = priceImg || midGoods.price_img;
            summa = summa || midGoods.summa;
            barcode = barcode || midGoods.barcode;
            artikul = artikul || midGoods.artikul;

            midGoods.set({
                name,
                description,
                group,
                price,
                price_img: priceImg,
                summa, 
                artikul,
                barcode
              });
              
            const goods = await midGoods.save();
            // console.log(goods)
 
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





        async createPriceTable(req, res, next) {
            const { name, note, price } = req.body;
            
            try {

                const result = await Price.create({
                    value: JSON.stringify({ name, note, price })
                });
        
                return res.json(result);
            } catch (e) {
                appendFiles(`\n610: ${e.message}`)
                return next(
                    ApiError.internal(`610: ${e.message}`)
                );
            }
        }




        async fetchOnePrice(req, res, next) {
            const { priceId } = req.body;
            
            try {

                const result = await Price.findByPk(priceId);
                console.log(result)
        
                return res.json(result);
            } catch (e) {
                appendFiles(`\n610: ${e.message}`)
                return next(
                    ApiError.internal(`610: ${e.message}`)
                );
            }
        }
    



        async updatePriceTable(req, res, next) {
            const { name, note, price, priceId } = req.body;
            
            try {

                const result = await Price.update({
                    value: JSON.stringify({ name, note, price })
                }, {where: {id: priceId}});
        
                return res.json(result);
            } catch (e) {
                appendFiles(`\n610: ${e.message}`)
                return next(
                    ApiError.internal(`610: ${e.message}`)
                );
            }
    
        }



        
        async updateGoodsByExel(req, res, next) {
            const img = req.files.image;

        try {

            const fileName = uuid.v4() + img.name;
            await img.mv(path.resolve(__dirname, "..", "static", fileName));

            const workSheetsFromFile = xlsx.parse(`${__dirname}/../static/${fileName}`);
            console.log(workSheetsFromFile[0].data)

            let midArray = workSheetsFromFile[0].data

            for(let x of midArray){
                if(!x[0]) break;   
                if(x[0].search(/\d{5}/) === -1) return res.status(432).json({message: 'артикул не соответствует'});

                let newGoods = await Goods.increment({summa: +x[2]}, {where: {artikul: x[0]}}) 
        
            }

            await fs.promises.unlink(__dirname + "/../" + "static/" + fileName); 


            return res.json({success: true});
            } catch (e) {
                appendFiles(`\n610: ${e.message}`)
                return next(
                    ApiError.internal(`610: ${e.message}`)
                );
            }
    
    
        }


        async updatePriceTableB(req, res, next) {
            const { name, note, price: a } = req.body;
            // console.log(a)
            let transaction;
            try {
                transaction = await sequelize.transaction();
                const vizit = [
                    [
                        [ [ a[0].a, a[0].b, a[0].c, a[0].d ], [ a[1].a, a[1].b, a[1].c, a[1].d ], [ a[2].a, a[2].b, a[2].c, a[2].d ] ],
                        [ [ a[3].a, a[3].b, a[3].c, a[3].d ], [ a[4].a, a[4].b, a[4].c, a[4].d ], [ a[5].a, a[5].b, a[5].c, a[5].d ] ], 
                        [ [ a[6].a, a[6].b, a[6].c, a[6].d ], [ a[7].a, a[7].b, a[7].c, a[7].d ], [ a[8].a, a[8].b, a[8].c, a[8].d ] ]
                    ],
                    [
                        [ [ a[9].a, a[9].b, a[9].c, a[9].d ], [ a[10].a, a[10].b, a[10].c, a[10].d ], [ a[11].a, a[11].b, a[11].c, a[11].d ] ],
                        [ [ a[12].a, a[12].b, a[12].c, a[12].d ], [ a[13].a, a[13].b, a[13].c, a[13].d ], [ a[14].a, a[14].b, a[14].c, a[14].d ] ],
                        [ [ a[15].a, a[15].b, a[15].c, a[15].d ], [ a[16].a, a[16].b, a[16].c, a[16].d ], [ a[17].a, a[17].b, a[17].c, a[17].d ] ]
                    ]
                ];

                const goods = await Jsona.update({
                    value: JSON.stringify(vizit)
                }, {where: {id: 2}, transaction});

                const result = await Price.update({
                    value: JSON.stringify({ name, note, price: a })
                }, {where: {id: 14}, transaction});

                await transaction.commit();

                return res.json(result);
            } catch (e) {
                appendFiles(`\n610: ${e.message}`)
                if(transaction) {
                    await transaction.rollback();
                 }
                return next(
                    ApiError.internal(`610: ${e.message}`)
                );
            }
        }



        async updatePriceTableC(req, res, next) {
            const { name, note, price: a } = req.body;
            // console.log(a)
            let transaction;
            try {
                transaction = await sequelize.transaction();
                const vizit = [
                    [
                        [ a[0].a, a[1].a, a[2].a, a[3].a ], 
                        [ a[0].b, a[1].b, a[2].b, a[3].b ], 
                        [ a[0].c, a[1].c, a[2].c, a[3].c ],
                        [ a[0].d, a[1].d, a[2].d, a[3].d ], 
                        [ a[0].e, a[1].e, a[2].e, a[3].e ], 
                        [ a[0].f, a[1].f, a[2].f, a[3].f ],
                        [ a[0].g, a[1].g, a[2].g, a[3].g ], 
                        [ a[0].h, a[1].h, a[2].h, a[3].h ]
                    ],
                    [ a[4].a, a[4].b, a[4].c, a[4].d, a[4].e, a[4].f, a[4].g, ]
                ];

                const goods = await Jsona.update({
                    value: JSON.stringify(vizit)
                }, {where: {id: 3}, transaction});

                const result = await Price.update({
                    value: JSON.stringify({ name, note, price: a })
                }, {where: {id: 17}, transaction});

                await transaction.commit();

                return res.json(result);
            } catch (e) {
                appendFiles(`\n610: ${e.message}`)
                if(transaction) {
                    await transaction.rollback();
                 }
                return next(
                    ApiError.internal(`610: ${e.message}`)
                );
            }
        }
        
        
        
        async updatePriceTableD(req, res, next) {
            const { name, note, price: a } = req.body;
            // console.log(a)
            let transaction;
            try {
                transaction = await sequelize.transaction();
                const vizit = [
                    [
                        [ a[0].a, a[1].a ], 
                        [ a[0].b, a[1].b ], 
                        [ a[0].c, a[1].c ], 
                        [ a[0].d, a[1].d ], 
                        [ a[0].e, a[1].e ], 
                        [ a[0].f, a[1].f ], 
                        [ a[0].g, a[1].g ]
                    ],
                    a[2].a,
                    a[2].b
                ];

                const goods = await Jsona.update({
                    value: JSON.stringify(vizit)
                }, {where: {id: 4}, transaction});

                const result = await Price.update({
                    value: JSON.stringify({ name, note, price: a })
                }, {where: {id: 19}, transaction});

                await transaction.commit();

                return res.json(result);
            } catch (e) {
                appendFiles(`\n610: ${e.message}`)
                if(transaction) {
                    await transaction.rollback();
                 }
                return next(
                    ApiError.internal(`610: ${e.message}`)
                );
            }
        }

}

module.exports = new GoodsController();
