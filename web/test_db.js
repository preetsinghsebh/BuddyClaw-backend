const mongoose = require('mongoose');
const uri = "mongodb+srv://mem98676_db_user:l6bZURRPYrHscclZ@friendclaw.u9uwmri.mongodb.net/?retryWrites=true&w=majority&appName=FRIENDCLAW";

async function test() {
    console.log("Attempting to connect to MongoDB Atlas...");
    try {
        await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
        console.log("Connected successfully!");
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log("Collections:", collections.map(c => c.name));
        process.exit(0);
    } catch (err) {
        console.error("Connection failed:", err.message);
        process.exit(1);
    }
}

test();
