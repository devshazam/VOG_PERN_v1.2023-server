const { Jsona , Editor, Editobjects} = require("../models/models");
const ApiError = require("../error/ApiError");
const { appendFiles } = require("../error-log/LogHandling");
const uuid = require("uuid");
const path = require("path");
const xlsx = require('node-xlsx');
const fs = require("fs");


class JsonaController {

    async createObject(req, res, next) {
        try {
            let {rank} = req.body
            const {image} = req.files
            let fileName = uuid.v4() + ".jpg"
            image.mv(path.resolve(__dirname, '..', 'static', fileName))
            const device = await Editor.create({rank, img: fileName});
            return res.json(device)
        } catch (e) {
            console.log(`Error: 611; ${e.message}`)
            return next(
                ApiError.internal(
                    `611: ${e.message}`
                )
            );
        }
    }   


    async createObjectEditor(req, res, next) {
        try {
            let {rank, value} = req.body
            const {image} = req.files
            let fileName = uuid.v4() + ".jpg"
            image.mv(path.resolve(__dirname, '..', 'static', fileName))
            const device = await Editobjects.create({rank, img: fileName, value});
            return res.json(device)
        } catch (e) {
            console.log(`Error: 611; ${e.message}`)
            return next(
                ApiError.internal( 
                    `611: ${e.message}`
                )
            );
        }
    }   

    async getObjectEditor(req, res, next) {
        try {
            let {rank} = req.body
            const project = await Editobjects.findAll({
                where: {
                  rank
                },
              });
            return res.json(project);
        } catch (e) {
            console.log(`Error: 611; ${e.message}`)
            return next(
                ApiError.internal(
                    `611: ${e.message}`
                )
            );
        }
    }  
    
    
    async getObject(req, res, next) {
        try {
            let {rank} = req.body
            const project = await Editor.findAll({
                where: {
                  rank
                },
              });
            return res.json(project);
        } catch (e) {
            console.log(`Error: 611; ${e.message}`)
            return next(
                ApiError.internal(
                    `611: ${e.message}`
                )
            );
        }
    }   

    async fetchJson(req, res, next) {

        try {
            const json = await Jsona.findByPk(1);
            return res.json(json);
        } catch (e) {
            console.log(`Error: 611; ${e.message}`)
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
            console.log(`Error: 614; ${e.message}`)
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
            console.log(`Error: 611; ${e.message}`)
            return next(
                ApiError.internal(
                    `611: ${e.message}`
                )
            );
        }
    }   




}

module.exports = new JsonaController();
