import mongoose from 'mongoose'
import connectDB from './src/config/db.js'
import Artist from './src/models/Artist.js'
import Genre from './src/models/Genre.js'

const genresData = [
  {
    name: 'Story Telling',
    description: 'Narrative performances, personal stories, and storytelling art.',
  },
  {
    name: 'Poetry',
    description: 'Poetic recitals, Hindi/Hinglish poetry, and verse expressions.',
  },
  {
    name: 'Spoken Word',
    description: 'Performance poetry, rhythmic wordplay, and stage performances.',
  },
  {
    name: 'Ghazal',
    description: 'Classic and contemporary poetic expressions set to rhythm and verse.',
  },
  {
    name: 'Social Cause',
    description: 'Stories and poetry addressing societal issues and meaningful change.',
  },
]

const artistsData = [
  {
    name: 'Nehal Bhanushali',
    bio: `Nehal Bhanushali is a Mumbai-based spoken word artist, writer, and performer who began her journey with poetry as a deeply personal form of expression, and has since evolved into a voice that resonates with many.

Her work explores love, identity, womanhood, and the quiet complexities of everyday relationships- often leaving audiences feeling seen, heard, and understood.

Over the years, she has taken her words from intimate beginnings to live stages, opening for renowned artists and performing across multiple platforms. With a style that blends vulnerability and strength, Nehal’s performances feel both personal and powerful.

Through every piece, she creates a space where emotions are not just expressed, but deeply experienced.`,
    avatarUrl: 'https://drive.google.com/drive/folders/1gyN3xep3dLM54wITCUmIg3OomtwqmLfE?usp=drive_link',
    genre: 'Story Telling',
    socialLinks: {
      instagram: null,
      twitter: null,
      website: null,
    },
    videoCount: 1,
    followerCount: 150,
    isVerified: true,
    isActive: true,
  },
  {
    name: 'Pragati Bachhawat',
    bio: `Pragati Bachhawat is the author of Maun Seeta Kee Ramayan, her debut poetry book that portrays eighteen prominent characters from the Ramayan through the author’s unique perspective. The book blends prose and poetry and is complemented by expressive illustrations created by an illustrator, ensuring an authentic representation of each character’s emotions.

The book was recognised as a “fast-selling” title at the Notion Press stall during the International Delhi Book Fair 2025.

Her work has also been featured in the anthology 7575 Poems in a Book, published by ESN Publications and recognised by the India Book of Records (2022). In addition, her poetry appeared in the anthology 1111 Poems in One Book, published by the London Book of Records (2021).

Her Hindi translation work Parakram Aur Parampara was published in 2023. Pragati Bachhawat is also a stage performer known for storytelling and poetry recitals.`,
    avatarUrl: 'https://drive.google.com/drive/folders/1xLvk7C8S6awniTNOB14_kl807dzOtJys?usp=drive_link',
    genre: 'Story Telling',
    socialLinks: {
      instagram: null,
      twitter: null,
      website: null,
    },
    videoCount: 2,
    followerCount: 220,
    isVerified: true,
    isActive: true,
  },
  {
    name: 'Suchhee aka Sakhiii',
    bio: `Suchi Bansal lives life with a singular mission: to explore everything it has to offer. A Chartered Accountant by day and a storyteller at heart, she is a Financial Analyst who balances the structured world of numbers with a fearless pursuit of creative and spiritual growth. Rather than choosing a single path, Suchi embraces a multi-passionate life as a poet, storyteller, and aspiring author. She actively explores the arts through Hindustani classical music and classical Kathak dance, and as an avid traveler, she uses her journeys to deeply understand diverse perspectives. Ultimately, she blends logic and artistry to constantly expand her horizons as both a human being and a creator. The latest colour to her vision is finding Arturee—a dream she intends to paint the art world with!`,
    avatarUrl: null,
    genre: 'Story Telling',
    socialLinks: {
      instagram: null,
      twitter: null,
      website: null,
    },
    videoCount: 4,
    followerCount: 310,
    isVerified: true,
    isActive: true,
  },
  {
    name: 'Able Nari by Phullo Begum',
    bio: `Phullo Begum is an award-winning trained theatre artist, storyteller, podcaster, corporate trainer and creator behind Able Nari, recognized as Super Woman 2020. A former CSO at Platocast, she has produced 30+ podcast shows, mentored 50+ podcasters, and collaborated with platforms such as Arre Voice, Pocket FM, and Bizgurukul. Her creative journey spans podcasting, short films selected at Cannes, and international children's festivals. Through humour, poetry, satire, and relatable storytelling, she explores the many layers of womanhood, relationships, motherhood, work, identity, and self-respect. Able Nari is her mission to challenge stereotypes and replace the word "Abla" with "Able"—celebrating women not as labels, but as capable, complex, and complete human beings.`,
    avatarUrl: 'https://drive.google.com/drive/folders/1yVcgiRX8sU-MsYjcBD33yj-JiqRTWRkz?usp=drive_link',
    genre: 'Story Telling',
    socialLinks: {
      instagram: null,
      twitter: null,
      website: null,
    },
    videoCount: 3,
    followerCount: 450,
    isVerified: true,
    isActive: true,
  },
  {
    name: 'Author Anjali Jain',
    bio: `Author Anjali Jain is a curious writer; her words are both sword and shield. She believes:
“Ik lahar hu — kabhi shant, kabhi toofani; jitni chanchal utni hi gehri.”
Apart from writing, the only thing she truly enjoys is breathing.`,
    avatarUrl: 'https://drive.google.com/drive/folders/15QGwWJ2DLiOgovZFt8L3B6pFDOB4eySa?usp=drive_link',
    genre: 'Story Telling',
    socialLinks: {
      instagram: null,
      twitter: null,
      website: null,
    },
    videoCount: 1,
    followerCount: 180,
    isVerified: true,
    isActive: true,
  },
]

const seedDatabase = async () => {
  try {
    console.log('🌱 Connecting to database...')
    await connectDB()

    console.log('🧹 Clearing existing Artist and Genre records...')
    await Artist.deleteMany({})
    await Genre.deleteMany({})
    console.log('✔ Existing records cleared.')

    console.log('📚 Seeding Genres...')
    const insertedGenres = await Genre.insertMany(genresData)
    console.log(`✔ Successfully inserted ${insertedGenres.length} genres.`)

    console.log('🎨 Seeding Artists...')
    const insertedArtists = await Artist.insertMany(artistsData)
    console.log(`✔ Successfully inserted ${insertedArtists.length} artists:`)
    insertedArtists.forEach((artist, i) => {
      console.log(`   ${i + 1}. ${artist.name} (${artist.genre})`)
    })

    console.log('\n🎉 Database seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error during seeding:', error)
    process.exitCode = 1
  } finally {
    await mongoose.connection.close()
    console.log('🔌 Database connection closed.')
    process.exit()
  }
}

seedDatabase()
