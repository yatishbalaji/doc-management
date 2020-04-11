const _ = require('lodash');
const { ObjectId } = require('mongoose').Types;

const FileModel = require('./file.model');

async function index(req, res, next) {
    try {
        const { page = 1 } = req.query;
        const reqUser = req.user;

        const query = Object.assign({
            deleted_on: null,
            $or: [{
                created_by: reqUser.id,
            }, {
                "users._id": reqUser.id,
            }],
        });

        const data = await FileModel.find(query)
            .skip((page - 1) * 10)
            .limit(10);

        return res.json(data);
    } catch (err) {
        return next(err);
    }
}

async function create(req, res, next) {
    try {
        const body = req.body;
        const reqUser = req.user;
        const requiredKeys = ['name', 'contents'];

        const hasAll = _.every(requiredKeys, _.partial(_.has, body));
        
        if (!hasAll) {
            return res.status(412).json({ message: 'Required fields missing' });
        }

        const data = await FileModel.create({
            ..._.pick(body, requiredKeys),
            created_by: reqUser._id,
            updated_by: reqUser._id,
            users: [{
                _id: reqUser._id,
                name: reqUser.name,
                accessed_on: new Date(),
            }]
        });

        return res.json(data);
    } catch (err) {
        return next(err);
    }
}

async function share(req, res, next) {
    try {
        const body = req.body;

        if (!body.users) {
            return res
                .status(412)
                .json({ message: 'Required fields missing' });
        }

        await Promise.all([
            FileModel.update({
                _id: new ObjectId(req.params.id),
            }, {
                $push: {
                    users: body.users.map(u => ({
                        ...u,
                        _id: new ObjectId(u._id)
                    })),
                },
            }),
            await FileModel.findByIdAndUpdate(
                { _id: req.params.id },
                {
                    updated_by: req.user._id,
                    updated_on: new Date(),
                }
            ),
        ]);

        return res.sendStatus(204);
    } catch (err) {
        return next(err);
    }
}

async function show(req, res, next) {
    try {
        const _id = req.params.id;
        const reqUser = req.user;

        const file = await FileModel.findOne({
            _id,
            $or: [{
                created_by: reqUser._id,
            }, {
                "users._id": reqUser._id,
            }]
        });

        await FileModel.findOneAndUpdate(
            {
                _id,
                "users._id": reqUser._id,
            },
            {
                $set: { "users.$.accessed_on" : new Date() },
            },
        );

        return res.json(file);
    } catch (err) {
        return next(err);
    }
}

async function update(req, res, next) {
    try {
        const body = req.body;
        const _id = req.params.id;
        const reqUser = req.user;

        await FileModel.findOneAndUpdate(
            {
                _id,
            },
            {
                $set: {
                    contents: body.contents,
                    updated_by: reqUser._id,
                    updated_on : new Date(),
                },
            },
        );

        return res.sendStatus(204);
    } catch (err) {
        return next(err);
    }
}

module.exports = {
    index,
    create,
    share,
    show,
    update
};
