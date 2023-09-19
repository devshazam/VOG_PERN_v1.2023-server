const { Jsona } = require("../models/models");
const ApiError = require("../error/ApiError");
const { appendFiles } = require("../error-log/LogHandling");

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


}

module.exports = new JsonaController();
