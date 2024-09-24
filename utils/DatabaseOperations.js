const mongoose = require('mongoose');


class DatabaseOperations {
    constructor() {
        if (DatabaseOperations.instance) {
            return DatabaseOperations.instance;
        }
        DatabaseOperations.instance = this;
    }


    // get instance of db  
    // make sure db dosent conected twis
    static getInstance() {
        if (!DatabaseOperations.instance) {
            DatabaseOperations.instance = new DatabaseOperations();
        }
        return DatabaseOperations.instance;
    }

    // connect to db 
    async connect(url = process.env.NEXT_PUBLIC_DB_URL) {
        if (mongoose.connection.readyState === 1) {
            console.log('Already connected to DB');
            return;
        }
        try {
            await mongoose.connect(url);
            console.log('DB Connected');
        } catch (err) {
            console.log('Problem in Connecting DB:', err);
            throw err;
        }
    }


    createModel(modelName, schema) {
        return mongoose.model(modelName, new mongoose.Schema(schema, { timestamps: true }));
    }


    async createCollection(modelName, schema) {
        try {
            const model = this.createModel(modelName, schema);
            await model.createCollection();
            return { message: `Collection ${modelName} created successfully` };
        } catch (error) {
            return { error: error.message };
        }
    }


    // select one or more items
    async select(model, conditions = {}) {

        const modifiedConditions = { ...conditions, isDeleted: false };

        try {
            const results = await model.find(modifiedConditions);
            return { data: results };
        } catch (error) {
            return { error: error.message };
        }
    }

    async findOne(model, conditions = {}) {
        const modifiedConditions = { ...conditions, isDeleted: false };
        try {
            const result = await model.findOne(modifiedConditions);

            // return data if there is no data return null thats mean nt find
            return result ? { data: result } : { data: null };
        } catch (error) {
            return { error: error.message };
        }
    }


    async insert(model, data) {
        try {
            const newDoc = new model(data);
            const result = await newDoc.save();
            return { message: 'Insert successful', insertedId: result._id, data: result };
        } catch (error) {
            return { error: error.message };
        }
    }


    async update(model, conditions = {}, data, options = { new: false }) {
        const modifiedConditions = { ...conditions, isDeleted: false };
        try {
            const result = await model.updateMany(modifiedConditions, data, options);
            return { message: 'Update successful', modifiedCount: result.modifiedCount };
        } catch (error) {
            return { error: error.message };
        }
    }

    async findOneAndUpdate(model, conditions = {}, data, options = { new: false }) {
        const modifiedConditions = { ...conditions, isDeleted: false };
        try {
            const result = await model.findOneAndUpdate(modifiedConditions, data, options);
            return { message: 'Update successful', modifiedCount: result ? 1 : 0 };
        } catch (error) {
            return { error: error.message };
        }
    }


    async deleteMany(model, conditions) {
        const modifiedConditions = { ...conditions, isDeleted: false };
        try {
            const result = await model.deleteMany(modifiedConditions);
            return { message: 'Delete successful', deletedCount: result.deletedCount };
        } catch (error) {
            return { error: error.message };
        }
    }


    async softDelete(model, conditions = {}, options = { new: false }) {
        const modifiedConditions = { ...conditions, isDeleted: false };
        try {
            const result = await model.findOneAndUpdate(modifiedConditions, { isDeleted: true }, options);
            if (!result) {
                return { message: 'Document not found or already deleted', modifiedCount: 0 };
            }
            return { message: 'Soft Deleted Successfully', modifiedCount: 1, data: result };
        } catch (error) {
            return { error: error.message };
        }
    }




    async hardDelete(model, conditions) {
        const modifiedConditions = { ...conditions, isDeleted: false };
        try {
            const result = await model.deleteOne(modifiedConditions);
            if (result.deletedCount === 0) {
                return { error: 'No document found with the given conditions' };
            }
            return { message: 'Delete successful', deletedCount: result.deletedCount };
        } catch (error) {
            return { error: error.message };
        }
    }
}

module.exports = DatabaseOperations;