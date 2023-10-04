const { Jsona } = require("../models/models");
const ApiError = require("../error/ApiError");
const { appendFiles } = require("../error-log/LogHandling");
const uuid = require("uuid");
const path = require("path");
const xlsx = require('node-xlsx');
const fs = require("fs");


class JsonaController {



    async fetchJson(req, res, next) {

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


    
    async fetchPriceOfProduce(req, res, next) {
        let { jsonId } = req.body;

        try {
            const json = await Jsona.findByPk(jsonId);
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
