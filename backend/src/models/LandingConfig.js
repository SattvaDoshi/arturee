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
        default: [
          {
            title: 'Visual Symphony',
            subtitle: '',
            imageUrl:
              'https://lh3.googleusercontent.com/aida-public/AB6AXuBnsgMc-9vWB2jVZnNY9OxoK8_BaZASds2u3vuoZZc4O7X0MDZWge7YPEJtPFWKGKcOK9n8fdj7q_tvvKjH2PIbS8sG1Rh3vDSk1TVEbhDVGK7u0LzC1JQLs6sPuTfmhUgDFENXG_haHS5GFKfnpXrpGLQOsFhHBaMxfIYhahDCScBhiD6VnLxXG9vvOAKh0kEvytrJhTXy5GHTF1QV8jVz5F5UQrBHINz-gtU7ujs1LMASn9d9VGc0bA9oKxl_LQt3M84YGgbN--4',
            tag: 'Featured Premiere',
            link: '/pricing',
          },
          {
            title: 'Digital Renaissance',
            subtitle: 'Original Series • 8 Episodes',
            imageUrl:
              'https://lh3.googleusercontent.com/aida-public/AB6AXuCt-jEXc91uTeJMaVK6zjnOMFJKCGus_B1r6AYlGDj7_wlxzJJBj_lRGPAWkyiE4Qr7cD4sfnnIdlZ3bSfgEuHe89crQEMsg3-ReTjP-VsU7nFrMufroLvl2bb7Hz5wWv1HzpQ_PZVZ_NebgzWxa_pBZpZLxR2Gpg8fOVsTWb9266HoYO5I924k2u04SvPfegjaO3GWO6B8EPlCUe2h44GXeTJD8Xeer3p1eV5E31cIXxxzHmgt5I0Sx4Ny_RKL1i8NICHTI6242mQ',
            tag: 'Trending',
            link: '/pricing',
          },
          {
            title: 'The Beat Lab',
            subtitle: 'Documentary • Feature Film',
            imageUrl:
              'https://lh3.googleusercontent.com/aida-public/AB6AXuDORGisarDYAqiHhwqXhYY4WJNNlgj2-xTq1FnVgjAhSlFDLWIHSnN0BTssUzt-B3SegXY1P0OTnOLyOPsxsBP3HcUPad0uxdr7a3D5jEV2kEvyNbdgDyE4z8D4lnNshop8mrxEwEmvktNDOZq_7VYRiuDS-LNg9xnqAABIzCrNeTEPaFezdoe_QKqILe1LWPMYt8AXrdeSvSsbottdWIGtzjVO4KmsTHdxx8rB-u3hnWjRXN0FnFfTts5w-JYkpsSh_Q1C6LSR3Yg',
            tag: '',
            link: '/pricing',
          },
          {
            title: 'Vivid Sessions',
            subtitle: 'Live Sessions • Weekly',
            imageUrl:
              'https://lh3.googleusercontent.com/aida-public/AB6AXuBSlu6MXincC_nuFxgb0-Qvvi98L2ihaUkswQOo-vb-lFvwESZwA-LdRVspW60Iny8RYTUaL4Ja1TMJ5JeFLL8V3SoUsgPHbo_goFB2AYNXyH1LExdnnkRSudA47pH8kPDDUHrFsLZDQ4AzPU98TYnGaWvPk4vRPLXdiyLiz15XJoDcjwmTc0hdzANZI83gpdb0XODPeJxofCLh9C_EenN5SJJsfR56_URLhCtCsiEWzYSKMLbTr3vs_cU9hGtU8mPKrldjwSdeMRo',
            tag: '',
            link: '/pricing',
          },
          {
            title: 'Neon Pulse',
            subtitle: '',
            imageUrl:
              'https://lh3.googleusercontent.com/aida-public/AB6AXuCsy8ybTozKR1HiRFdBhwUpfnIGozYNMfABlXdQSgfAjiMjlUC3_inSVNVMv0vf3VQy0tt5e39uzqccD28xR9aQjOTVCj1NBgt-KYcyYBysCMcUCR7RGxqHpPugUXfq18gRtF8JPVi6-lR_Fd7jsZlWfWVtAeB2YDeWTObwihEy4BFEbO5hckAKWe7z4Eo36D2eg2oIiitpulF8UxpA6mzZg9djheSNosdv_VdsKLChme6M28deuo6FmJKD7T5k3fPmH9h7PHjz_e8',
            tag: '',
            link: '/pricing',
          },
        ],
      },
    },
  },
  { timestamps: true }
)

const LandingConfig = mongoose.model('LandingConfig', landingConfigSchema)
export default LandingConfig
