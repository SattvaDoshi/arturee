import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const db = mongoose.connection.db;
    const videos = await db.collection('videos').find({}, { projection: { title: 1, _id: 0 } }).toArray();
    console.log("Videos in DB:", videos);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
