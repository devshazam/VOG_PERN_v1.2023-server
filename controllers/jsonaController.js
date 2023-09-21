const { Jsona } = require("../models/models");
const ApiError = require("../error/ApiError");
const { appendFiles } = require("../error-log/LogHandling");
const uuid = require("uuid");
const path = require("path");
const xlsx = require('node-xlsx');
const fs = require("fs");


class JsonaController {

        // POST(_1_): `api/goods/` + `/`
//         async createPrice(req, res, next) {
//             const { jsonValue } = req.body;
//             console.log(typeof jsonValue)
// const qwe = {val: true}
//             try {
//                 var myJSON = JSON.stringify(qwe); // --> json

//                 const price = await Jsona.create({
//                     value: myJSON
//                 });
        
//                 return res.json(JSON.parse(price.value));
//             } catch (e) {
//                 appendFiles(`\n610: ${e.message}`)
//                 return next(
//                     ApiError.internal(`610: ${e.message}`)
//                 );
//             }
//         }
    


    // GET(_2_): `api/goods/` + `/fetch-list`
    async fetchJson(req, res, next) {
        // let { jsonId } = req.body;

        try {
            const json = await Jsona.findByPk(1);
            return res.json(json);
        } catch (e) {
            appendFiles(`\n611: ${e.message}`)
            return next(
                ApiError.internal(
                    `611: ${e.message}`
                )
            );
        }
    }   


    async updateJson(req, res, next) {
        // const { priceId, jsonValue } = req.body;

        try {
            const json = await Jsona.findByPk(1);
            let myJSON;
            if(JSON.parse(json.value).val){
                myJSON = JSON.stringify({val: false})
            }else{
                myJSON = JSON.stringify({val: true})
            }
            const goods = await Jsona.update({
                value: myJSON
            }, {where: {id: 1}});

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


    
    async updatePriceByExel(req, res, next) {
        // const { priceId, jsonValue } = req.body;
        const img = req.files.image;

        try {

            const fileName = uuid.v4() + img.name;
            await img.mv(path.resolve(__dirname, "..", "static", fileName));

            const workSheetsFromFile = xlsx.parse(`${__dirname}/../static/${fileName}`);
            // console.log(workSheetsFromFile[0].data)

            let a = workSheetsFromFile[0].data
            const vizit = [
                [
                    [
                        [ a[1][3], a[1][4], a[1][5], a[1][6] ],
                        [ a[2][3], a[2][4], a[2][5], a[2][6] ],
                        [ a[3][3], a[3][4], a[3][5], a[3][6] ],
                    ],
                    [
                        [ a[4][3], a[4][4], a[4][5], a[4][6] ],
                        [ a[5][3], a[5][4], a[5][5], a[5][6] ],
                        [ a[6][3], a[6][4], a[6][5], a[6][6] ],
                    ], 
                    [
                        [ a[7][3], a[7][4], a[7][5], a[7][6] ],
                        [ a[8][3], a[8][4], a[8][5], a[8][6] ],    
                        [ a[9][3], a[9][4], a[9][5], a[9][6] ],
                    ]
                ],
                [
                    [
                        [ a[10][3], a[10][4], a[10][5], a[10][6] ],
                        [ a[11][3], a[11][4], a[11][5], a[11][6] ],
                        [ a[12][3], a[12][4], a[12][5], a[12][6] ],
                    ],
                    [
                        [ a[13][3], a[13][4], a[13][5], a[13][6] ],
                        [ a[14][3], a[14][4], a[14][5], a[14][6] ],
                        [ a[15][3], a[15][4], a[15][5], a[15][6] ],
            
                    ],
                    [
                        [ a[16][3], a[16][4], a[16][5], a[16][6] ],
                        [ a[17][3], a[17][4], a[17][5], a[17][6] ],
                        [ a[18][3], a[18][4], a[18][5], a[18][6] ],
                    ]
                ]
            ];
            function midOne(array){
                array.map(item => {
                    if(Array.isArray(item)){
                        midOne(item)
                    }else{
                        if(!item){
                            return res.status(432).json({message: 'Не корректно заполнен файл'});
                        }
                    }
                })
            }
            midOne(vizit)

            const goods = await Jsona.update({
                value: JSON.stringify(vizit)
            }, {where: {id: 2}});


            await fs.promises.unlink(__dirname + "/../" + "static/" + fileName);


            return res.json({success: true});
        }  catch (error) {
            appendFiles(`\n614: ${error.message}`)
            return next(
                ApiError.internal(
                    `614: ${error.message}`
                )
            );
        }
    }


    
    async fetchArrayPriceOfVizits(req, res, next) {
        // let { jsonId } = req.body;

        try {
            const json = await Jsona.findByPk(2);
            return res.json(json);
        } catch (e) {
            appendFiles(`\n611: ${e.message}`)
            return next(
                ApiError.internal(
                    `611: ${e.message}`
                )
            );
        }
    }   


}

module.exports = new JsonaController();
