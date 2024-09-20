const mongoose = require('mongoose');


class NodeDaoMongodb {
    constructor() {
        if (NodeDaoMongodb.instance) {
            return NodeDaoMongodb.instance;
        }
        NodeDaoMongodb.instance = this;
    }


    // get instance of db 
    static getInstance() {
        if (!NodeDaoMongodb.instance) {
            NodeDaoMongodb.instance = new NodeDaoMongodb();
        }
        return NodeDaoMongodb.instance;
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
        try {
            const results = await model.find(conditions);
            return { data: results };
        } catch (error) {
            return { error: error.message };
        }
    }

    async findOne(model, conditions = {}) {
        try {
            const result = await model.findOne(conditions);

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


    async update(model, conditions, data) {
        try {
            const result = await model.updateMany(conditions, data);
            return { message: 'Update successful', modifiedCount: result.modifiedCount };
        } catch (error) {
            return { error: error.message };
        }
    }

    async delete(model, conditions) {
        try {
            const result = await model.deleteMany(conditions);
            return { message: 'Delete successful', deletedCount: result.deletedCount };
        } catch (error) {
            return { error: error.message };
        }
    }

    async deleteOne(model, conditions) {
        try {
            await model.delete(conditions);
            return { message: 'Delete successful' };
        } catch (error) {
            return { error: error.message };
        }
    }
}

module.exports = NodeDaoMongodb;