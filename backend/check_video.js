import mongoose from 'mongoose';
import Video from './src/models/Video.js';

mongoose.connect('mongodb+srv://artureebackend_db_user:B0CE70r3IcqdliXt@cluster0.gkdthvl.mongodb.net/arturee?appName=Cluster0')
  .then(async () => {
    const video = await Video.findOne({ title: /Abhi Nahi/i }).populate('genre categories');
    console.log(JSON.stringify(video, null, 2));
    process.exit(0);
  });
