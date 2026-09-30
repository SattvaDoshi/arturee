import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import Video from '../src/models/Video.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

async function syncSeriesViews() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to DB')

    const seriesVideos = await Video.find({ videoSource: 'series' }).populate('seriesEpisodes', 'viewCount')
    
    let updatedCount = 0;
    for (const series of seriesVideos) {
      const totalViews = series.seriesEpisodes.reduce((sum, ep) => sum + (ep.viewCount || 0), 0)
      if (series.viewCount !== totalViews) {
        console.log(`Updating series ${series.title} from ${series.viewCount} to ${totalViews} views`)
        await Video.updateOne({ _id: series._id }, { $set: { viewCount: totalViews } })
        updatedCount++
      }
    }
    
    console.log(`Successfully updated ${updatedCount} series.`)
    process.exit(0)
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

syncSeriesViews()
