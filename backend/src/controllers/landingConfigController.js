import asyncHandler from '../utils/asyncHandler.js'
import LandingConfig from '../models/LandingConfig.js'
import Artist from '../models/Artist.js'
import Genre from '../models/Genre.js'
import ApiError from '../utils/ApiError.js'

export const getLandingConfig = asyncHandler(async (req, res) => {
  let config = await LandingConfig.findOne({ key: 'default' })
    .populate('artistPage.artistCards.artistId')
    .populate('artistPage.featuredArtistId')
    .populate('genrePage.featuredGenres')

  if (!config) {
    const artists = await Artist.find({ isActive: true }).limit(8)
    const genres = await Genre.find().limit(8)

    const defaultTags = [
      { tag: 'Featured', tagColor: 'orange' },
      { tag: 'Trending', tagColor: 'lime' },
      { tag: 'Most Followed', tagColor: 'red' },
      { tag: 'Partner', tagColor: 'teal' },
    ]

    const initialCards = artists.map((a, i) => ({
      artistId: a._id,
      tag: defaultTags[i]?.tag || '',
      tagColor: defaultTags[i]?.tagColor || 'default',
      order: i,
    }))

    config = await LandingConfig.create({
      key: 'default',
      artistPage: {
        headline: 'The Artists',
        subheadline: 'Every art form tells a different story. Find yours.',
        artistCards: initialCards,
        featuredArtistId: artists[0]?._id || null,
        ctaTitle: 'Ignite the Artist in You',
        ctaText:
          'Arturee is your sky. Spread your wings, share your art, and earn from what you love.',
      },
      genrePage: {
        headline: 'Explore by Genre',
        subheadline: 'Passionate, fearless, and unapologetically authentic.',
        featuredGenres: genres.map((g) => g._id),
      },
      heroSection: {
        title: 'Where Art Speaks louder than Words',
        subtitle:
          'Discover premium spoken word, poetry, and storytelling performances.',
        ctaButtonText: 'Explore Artists',
        ctaButtonLink: '/artists',
      },
    })

    config = await LandingConfig.findById(config._id)
      .populate('artistPage.artistCards.artistId')
      .populate('artistPage.featuredArtistId')
      .populate('genrePage.featuredGenres')
  }

  res.status(200).json({ success: true, data: config })
})

export const updateLandingConfig = asyncHandler(async (req, res) => {
  const { artistPage, genrePage, heroSection, discoverSection } = req.body

  if (artistPage && Array.isArray(artistPage.artistCards)) {
    if (artistPage.artistCards.length > 8) {
      throw new ApiError(400, 'Maximum 8 artist cards are allowed on the landing page.')
    }
  }

  const updateFields = {}
  if (artistPage) updateFields.artistPage = artistPage
  if (genrePage) updateFields.genrePage = genrePage
  if (heroSection) updateFields.heroSection = heroSection
  if (discoverSection) updateFields.discoverSection = discoverSection

  let config = await LandingConfig.findOneAndUpdate(
    { key: 'default' },
    { $set: updateFields },
    { new: true, upsert: true, runValidators: true }
  )

  config = await LandingConfig.findById(config._id)
    .populate('artistPage.artistCards.artistId')
    .populate('artistPage.featuredArtistId')
    .populate('genrePage.featuredGenres')

  res.status(200).json({ success: true, data: config })
})
