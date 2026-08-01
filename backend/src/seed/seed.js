import mongoose from "mongoose";
import dotenv from "dotenv";

import Artist from "../models/Artist.js";
import Genre from "../models/Genre.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

// -----------------------------
// Genres
// -----------------------------
const genres = [
  {
    name: "Story Telling",
    description: "Narrative storytelling performances",
  },
  {
    name: "Poetry",
    description: "Poetry recitation and spoken poetry",
  },
];

// -----------------------------
// Artists
// -----------------------------
const artists = [
  {
    name: "Nehal Bhanushali",
    bio: `Nehal Bhanushali is a Mumbai-based spoken word artist, writer, and performer who began her journey with poetry as a deeply personal form of expression, and has since evolved into a voice that resonates with many.

Her work explores love, identity, womanhood, and the quiet complexities of everyday relationships, often leaving audiences feeling seen, heard, and understood.

Over the years, she has taken her words from intimate beginnings to live stages, opening for renowned artists and performing across multiple platforms. With a style that blends vulnerability and strength, Nehal’s performances feel both personal and powerful.

Through every piece, she creates a space where emotions are not just expressed, but deeply experienced.`,
    genre: "Story Telling",
    avatarUrl:
      "https://drive.google.com/drive/folders/1gyN3xep3dLM54wITCUmIg3OomtwqmLfE?usp=drive_link",
    isVerified: true,
  },

  {
    name: "Pragati Bachhawat",
    bio: `Pragati Bachhawat is the author of Maun Seeta Kee Ramayan, her debut poetry book that portrays eighteen prominent characters from the Ramayan through the author’s unique perspective.

The book blends prose and poetry with expressive illustrations and was recognised as a fast-selling title at the International Delhi Book Fair 2025.

Her work has also appeared in record-breaking poetry anthologies by the India Book of Records and London Book of Records.

She is also a Hindi translator, storyteller and stage performer.`,
    genre: "Poetry",
    avatarUrl:
      "https://drive.google.com/drive/folders/1xLvk7C8S6awniTNOB14_kl807dzOtJys?usp=drive_link",
    isVerified: true,
  },

  {
    name: "Suchhee aka Sakhiii",
    bio: `Suchi Bansal is a Chartered Accountant and Financial Analyst who balances the structured world of numbers with a fearless pursuit of creativity.

She is a poet, storyteller, aspiring author, Hindustani classical music enthusiast, Kathak learner, and avid traveller.

Her work blends logic with artistry while exploring spirituality, creativity and human emotions.`,
    genre: "Story Telling",
    avatarUrl: null,
    isVerified: true,
  },

  {
    name: "Able Nari by Phullo Begum",
    bio: `Phullo Begum is an award-winning theatre artist, storyteller, podcaster, corporate trainer and creator behind Able Nari.

Recognized as Super Woman 2020, she has produced over 30 podcast shows, mentored more than 50 podcasters and collaborated with leading platforms.

Her work explores womanhood, identity, relationships and self-respect through humour, satire and storytelling.`,
    genre: "Story Telling",
    avatarUrl:
      "https://drive.google.com/drive/folders/1yVcgiRX8sU-MsYjcBD33yj-JiqRTWRkz?usp=drive_link",
    isVerified: true,
  },

  {
    name: "Author Anjali Jain",
    bio: `Author Anjali Jain is a curious writer whose words are both sword and shield.

She believes:
"Ik lahar hu — kabhi shant, kabhi toofani; jitni chanchal utni hi gehri."

Apart from writing, the only thing she truly enjoys is breathing.`,
    genre: "Story Telling",
    avatarUrl:
      "https://drive.google.com/drive/folders/15QGwWJ2DLiOgovZFt8L3B6pFDOB4eySa?usp=drive_link",
    isVerified: true,
  },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("Connected to MongoDB");

    // Remove existing data
    await Artist.deleteMany({});
    await Genre.deleteMany({});

    console.log("Existing artists & genres deleted.");

    // Insert Genres
    const insertedGenres = await Genre.insertMany(genres);

    const genreMap = {};

    insertedGenres.forEach((g) => {
      genreMap[g.name] = g._id;
    });

    // Replace genre names with ObjectIds
    const artistDocs = artists.map((artist) => ({
      ...artist,
      genre: genreMap[artist.genre],
      followerCount: 0,
      videoCount: 0,
      isActive: true,
    }));

    await Artist.insertMany(artistDocs);

    console.log(`Inserted ${insertedGenres.length} genres.`);
    console.log(`Inserted ${artistDocs.length} artists.`);

    console.log("Seed completed successfully.");

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();