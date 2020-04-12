const _ = require('lodash');
const { ObjectId } = require('mongoose').Types;

const FileModel = require('./file.model');
const UserModel = require('../user/user.model');

async function index(req, res, next) {
    try {
        const reqUser = req.user;
        const { page = 1 } = req.query;
        let { sort, order } = req.query;
        
        if (sort === 'undefined') {
            sort = 'created_on';
            order = 'desc';
        }

        const query = Object.assign({
            deleted_on: null,
            $or: [{
                created_by: reqUser.id,
            }, {
                "users._id": reqUser.id,
            }],
        });

        let data = await FileModel.find(query)
            .skip((page - 1) * 10)
            .limit(10)
            .sort({ [sort]: order === 'asc' ? 1 : -1 })
            .select({ created_on: 1, users: 1, name: 1, created_by: 1 });
        
        const users = await UserModel.find({
            _id: { $in: data.map(doc => doc.created_by) }
        }).then(users => users.reduce((acc, u) => (
            Object.assign(acc, { [u._id]: u.name })
        ), {}));

        return res.json({ data, users });
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

        return res.status(201).json(data);
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
        }).select({ contents: 1, users: 1, name: 1, created_by: 1 });

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
                    name: body.name,
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
