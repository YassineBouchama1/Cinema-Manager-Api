const NodeDaoMongodb = require('./node-dao-mongodb');

const dbConnect = async () => {
    const nodeDaoMongodb = NodeDaoMongodb.getInstance();
    try {
        await nodeDaoMongodb.connect();
    } catch (error) {
        console.error('Failed to connect to database:', error);
        process.exit(1);
    }
};

module.exports = dbConnect;