const NodeDaoMongodb = require('../utils/DatabaseOperations');

const dbConnect = async () => {
    // const nodeDaoMongodb = NodeDaoMongodb.getInstance();
    try {
        await NodeDaoMongodb.connect();
    } catch (error) {
        console.error('Failed to connect to database:', error);
        process.exit(1);
    }
};

module.exports = dbConnect;