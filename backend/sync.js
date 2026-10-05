import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const { default: Video } = await import('./src/models/Video.js');
  const { default: Artist } = await import('./src/models/Artist.js');

  const videos = await Video.find({ artistId: { $ne: null } });
  const counts = {};
  
  for (const v of videos) {
    const totalReactions = Object.values(v.reactions || {}).reduce((a, b) => {
        if (typeof b === 'number') return a + b;
        return a;
    }, 0);
    const id = v.artistId.toString();
    counts[id] = (counts[id] || 0) + totalReactions;
  }
  
  for (const id of Object.keys(counts)) {
    await Artist.findByIdAndUpdate(id, { emoticonCount: counts[id] });
    console.log('Updated artist', id, 'to', counts[id]);
  }
  
  console.log('Done syncing emoticons!');
  process.exit(0);
});
