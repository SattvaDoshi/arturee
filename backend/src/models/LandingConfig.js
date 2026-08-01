import mongoose from 'mongoose'

const artistCardSchema = new mongoose.Schema(
  {
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Artist',
      required: true,
    },
    tag: {
      type: String,
      default: '',
      trim: true,
    },
    tagColor: {
      type: String,
      enum: ['orange', 'red', 'lime', 'teal', 'purple', 'blue', 'default'],
      default: 'orange',
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
)

const landingConfigSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      default: 'default',
      unique: true,
      required: true,
    },
    artistPage: {
      headline: { type: String, default: 'The Artists' },
      subheadline: {
        type: String,
        default: 'Every art form tells a different story. Find yours.',
      },
      artistCards: {
        type: [artistCardSchema],
        default: [],
        validate: [
          (val) => val.length <= 8,
          'Maximum 8 artist cards are allowed on the landing page.',
        ],
      },
      featuredArtistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Artist',
        default: null,
      },
      ctaTitle: { type: String, default: 'Ignite the Artist in You' },
      ctaText: {
        type: String,
        default:
          'Arturee is your sky. Spread your wings, share your art, and earn from what you love.',
      },
    },
    genrePage: {
      headline: { type: String, default: 'Explore by Genre' },
      subheadline: {
        type: String,
        default: 'Passionate, fearless, and unapologetically authentic.',
      },
      featuredGenres: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Genre',
        },
      ],
    },
    heroSection: {
      title: { type: String, default: 'Where Art Speaks louder than Words' },
      subtitle: {
        type: String,
        default:
          'Discover premium spoken word, poetry, and storytelling performances.',
      },
      ctaButtonText: { type: String, default: 'Explore Artists' },
      ctaButtonLink: { type: String, default: '/artists' },
    },
  },
  { timestamps: true }
)

const LandingConfig = mongoose.model('LandingConfig', landingConfigSchema)
export default LandingConfig
