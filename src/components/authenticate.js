const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongoose').Types;

const UserModel = require('../api/user/user.model');
const { JWT_KEY } = require('../config/environment');

async function authenticate(req, res, next) {
    try {
        // const token = (req.header('Authorization') || '')
        //     .replace('Bearer ', '');

        // if (!token) return res.sendStatus(401);

        // const data = jwt.verify(token, JWT_KEY);
        
        // const user = await UserModel.findOne({ _id: data._id });
        const user = await UserModel.findOne({
            _id: new ObjectId(req.body.user_id || req.query.user_id)
        });
        console.log("user", user);
        if (!user) return res.sendStatus(401);

        req.user = user;

        next();
    } catch (err) {
        console.log(err);
        return res.sendStatus(401);
    }
}

module.exports = authenticate;