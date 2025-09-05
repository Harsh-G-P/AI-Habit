import mongoose from "mongoose";

const MONGODB = process.env.MONGODB_URI
if(!MONGODB){
    throw new Error('Please define mongo environment variable')
}

async function connectToDB() {
    if (mongoose.connection.readyState === 1) {
        return mongoose
    }
    const opts={
        bufferCommands: false
    }

    await mongoose.connect(MONGODB!,opts)
    return mongoose
}

export default connectToDB