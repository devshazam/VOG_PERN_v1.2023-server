const uuid = require('uuid');
const path = require('path');
const {Device} = require('../models/models');
const ApiError = require('../error/ApiError');

class DeviceController {

    /* GET: - http://localhost:5000/api/device/ 
     * 
     * @param req.body      |   <form_input>        -> 0 
     *        req.file      |   <form_input_file>   -> 0 
     * @param req.params    |   /:id                -> 0 
     * @param req.query     |   /?param=1&          -> 0 
     * 
     * @return (json) 
     * 
     */
    
    async homePage(req, res, next) { // Done
     try {
        let created = await Device.findAll({
            order: [['createdAt', 'DESC']], // DESC -> from hight to low
            limit: 4
        });
        let price = await Device.findAll({
            order: [['price', 'ASC']], // ASC -> from low to hight
            limit: 4
        });
        let sale = await Device.findAll({
            order: [['sale', 'DESC']], // 
            limit: 4
        });
        // TODO: add custom list of devices by session
        return res.json({created: created, price: price, sale: sale})
    } catch (e) {
        next(ApiError.badRequest(e.message))
    }

    }


        /* GET: - http://localhost:5000/api/device/device-view/:id 
     * 
     * @param req.body      |   <form_input>        ->  0
     *        req.file      |   <form_input_file>   ->  0
     * @param req.params    |   /:id                ->  1
     * @param req.query     |   /?param=1&          ->  0
     * 
     * @return (json) 
     * 
     */

        async getOne(req, res, next) {
           try{
            const {id} = req.params
            // console.log(id);
            
            const device = await Device.findOne(
                {
                    where: {id: id}
                }
            )
            return res.json(device)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
        }


        /* POST: - http://localhost:5000/api/category/:category/:page   
     * 
     * @param req.body      |   <form_input>        ->  1
     *        req.file      |   <form_input_file>   ->  0
     * @param req.params    |   /:id                ->  1
     * @param req.query     |   /?param=1&          ->  0
     * 
     * @return (json) 
     * 
     */
    
        async getAll(req, res, next) {
           try{
            // return res.status(401).json({tt: 34})
        //    const {order} = req.body;
        const { category, page } = req.params;
            const offset = (page - 1) * 8;
            
            const devices = await Device.findAndCountAll({
                where: {category: category},
                order: [['name', 'DESC']], // DESC -> from hight to low
                // offset: offset,
                limit: 8
            });
    
     
            return res.json(devices)
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }
        }

    

// ################################# CLOSED:


    
    /* POST: - http://localhost:5000/api/device/create-device/      
     * 
     * @param req.body      |   <form_input>        ->  1   
     *        req.file      |   <form_input_file>   ->  1
     * @param req.params    |   /:id                ->  1
     * @param req.query     |   /?param=1&          ->  0
     * 
     * @return (json) 
     * 
     */
    
    async create(req, res, next) {
        try {
            const {name, price, old_price, sale, category} = req.body;
            const userId = req.user.id;
            const img = req.files.img;
            const fileName = uuid.v4() + ".jpg"
            img.mv(path.resolve(__dirname, '..', 'static', fileName))
            const device = await Device.create({name, price, old_price, sale, category, userId, img: fileName});
            
            return res.json(device)
            
        } catch (e) {
            next(ApiError.badRequest(e.message))
        }

    }






    /* GET: - http://localhost:5000/api/device/del/:id 
     * 
     * @param req.body      |   <form_input>        -> 0 
     *        req.file      |   <form_input_file>   -> 0 
     * @param req.params    |   /:id                -> 1 
     * @param req.query     |   /?param=1&          -> 0 
     * 
     * @return (json) 
     * 
     */ 

    async delete(req, res) {
        try{  
        const {id} = req.params;
        
        
        const device = await Device.destroy(
            {
                where: {id: id}
            }
        )
        return res.json(device)
    } catch (e) {
        next(ApiError.badRequest(e.message))
    }
    }
    
    /* GET: - http://localhost:5000/api/user-devices/
     * 
     * @param req.body      |   <form_input>        ->  0
     *        req.file      |   <form_input_file>   ->  0
     * @param req.params    |   /:id                ->  0
     * @param req.query     |   /?param=1&          ->  0
     * 
     * @return (json) 
     * 
     */

    async deviceListUser(req, res) {
        try{
        const userId = req.user.id;
        
        
        const devices = await Device.findAll({
            where: {userId: userId}
        });

        return res.json(devices)
    } catch (e) {
        next(ApiError.badRequest(e.message))
    }
    }


    /* POST: - http://localhost:5000/api/user-devices/change/:id
     * 
     * @param req.body      |   <form_input>        ->  1
     *        req.file      |   <form_input_file>   ->  1
     * @param req.params    |   /:id                ->  1
     * @param req.query     |   /?param=1&          ->  0
     * 
     * @return (json) 
     * 
     */
// TODO - to finish this method
    // async change(req, res) {
    //     try{
    //     const id = req.params;
    //     const {name, price, old_price, sale, category} = req.body;
    //     const userId = req.user.id;
    //     const {img} = req.files;
    //     const fileName = uuid.v4() + ".jpg"
    //     img.mv(path.resolve(__dirname, '..', 'static', fileName))
        
    //     await User.update({ lastName: "Doe" }, {where: {id: id}});

    
    //     return res.json(devices)
    // } catch (e) {
    //     next(ApiError.badRequest(e.message))
    // }
    // }

}

module.exports = new DeviceController()
