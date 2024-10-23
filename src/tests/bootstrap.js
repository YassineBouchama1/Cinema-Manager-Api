const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");


let mongoServer;

beforeAll(async () => {
    // start  in-memory MongoDB server
    try {
        mongoServer = await MongoMemoryServer.create();
        const uri = mongoServer.getUri();

        await mongoose.connect(uri, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });
    } catch (error) {
        console.error("Failed to connect to in-memory MongoDB:", error);
        throw error;
    }
});

afterAll(async () => {


    // clean up the database and close the connection
    await mongoose.connection.dropDatabase(); // drop the database to clean up
    await mongoose.connection.close(); // close the connection
    await mongoServer.stop(); // stop the MongoMemoryServer instance

});

afterEach(async () => {


    // clear all collections after each test
    const collections = mongoose.connection.collections;

    for (const key in collections) {
        const collection = collections[key];
        await collection.deleteMany(); // delete all documents in the collection
    }
});


beforeEach(() => {
    jest.clearAllMocks();
});

// process.on("unhandledRejection", (reason, promise) => {
//     console.error("Unhandled Rejection at:", promise, "reason:", reason);
// });