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

const discoverCardSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    tag: { type: String, default: '' },
    link: { type: String, default: '/pricing' },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
    },
  },
  { _id: false }
)

const pricingCardSchema = new mongoose.Schema(
  {
    label: { type: String, default: 'Single Video' },
    price: { type: Number, default: 49 },
    save: { type: String, default: '' },
    desc: { type: String, default: 'Watch any single video on the platform with 2 streams included.' },
    highlight: { type: Boolean, default: false },
    points: {
      type: [String],
      default: ['2 streams per video', 'HD quality streaming', 'Standard Rate', 'Instant access'],
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
    pricingSection: {
      headline: { type: String, default: 'Plans & Pricing' },
      subheadline: {
        type: String,
        default: 'Choose how you want to experience art — pay per video or bundle the pieces that move you.',
      },
      plans: {
        type: [pricingCardSchema],
        default: [
          {
            label: 'Single Video',
            price: 49,
            save: '',
            desc: 'Watch any single video on the platform with 2 streams included.',
            highlight: false,
            points: ['2 streams per video', 'HD quality streaming', 'Standard Rate', 'Instant access'],
          },
          {
            label: 'Bundle of 2',
            price: 89,
            save: 'Save Rs. 9',
            desc: 'Hand-pick 2 videos of your choice at a discounted bundle price.',
            highlight: false,
            points: ['Everything in Single', '2 videos of your choice', 'Discounted bundle price', 'HD quality streaming'],
          },
          {
            label: 'Bundle of 3',
            price: 129,
            save: 'Save Rs. 18',
            desc: 'Best value! Choose 3 videos and enjoy immersive storytelling.',
            highlight: true,
            points: ['Best Value bundle', '3 videos of your choice', 'Maximum savings', '4K + Dolby quality'],
          },
        ],
      },
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
          'arturee is your sky. Spread your wings, share your art, and earn from what you love.',
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
    discoverSection: {
      headline: { type: String, default: 'Exclusive Art' },
      subheadline: {
        type: String,
        default: 'Art : Anywhere and Everywhere',
      },
      ctaText: { type: String, default: 'View All' },
      ctaLink: { type: String, default: '/pricing' },
      cards: {
        type: [discoverCardSchema],
        default: [],
      },
    },
  },
  { timestamps: true }
)

const LandingConfig = mongoose.model('LandingConfig', landingConfigSchema)
export default LandingConfig
