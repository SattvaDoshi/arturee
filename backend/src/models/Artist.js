import mongoose from 'mongoose'

const artistSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    bio: { type: String, default: '', maxlength: 2000 },
    avatarUrl: { type: String, default: null },
    genre: { type: String, default: null },
    socialLinks: {
      instagram: { type: String, default: null },
      twitter: { type: String, default: null },
      website: { type: String, default: null },
    },
    videoCount: { type: Number, default: 0 },
    followerCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

const Artist = mongoose.model('Artist', artistSchema)
export default Artist
