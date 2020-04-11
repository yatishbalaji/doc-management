/**
 * @model file
 */

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const options = {
    versionKey : false,
};

var userAcessSchema = new Schema({
    _id: { type: Schema.Types.ObjectId },
    name: { type: String },
    accessed_on: { type: Date, default: Date.now }
});

const FileSchema = new Schema({
    name: { type: String },
    contents: { type : String },
	users:[userAcessSchema],
    created_by: { type: Schema.Types.ObjectId },
    created_on: { type: Date, default: Date.now },
    updated_by: { type: Schema.Types.ObjectId },
    updated_on: { type: Date, default: Date.now },
    deleted_by: { type: Schema.Types.ObjectId },
    deleted_on: { type: Date, default: null },
}, options);

module.exports = mongoose.model('File', FileSchema);
