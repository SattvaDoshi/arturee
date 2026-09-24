import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

import User from "../models/User.js";
import Artist from "../models/Artist.js";
import Genre from "../models/Genre.js";
import Video from "../models/Video.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI;

// -----------------------------
// Genres
// -----------------------------
const genres = [
  { name: "Story Telling", description: "Narrative storytelling performances" },
  { name: "Poetry", description: "Poetry recitation and spoken poetry" },
];

// -----------------------------
// Artists
// -----------------------------
const artistsData = [
  { 
    name: "Nehal Bhanushali", 
    bio: "Nehal Bhanushali is a Mumbai-based spoken word artist, writer, and performer who began her journey with poetry as a deeply personal form of expression, and has since evolved into a voice that resonates with many.\nHer work explores love, identity, womanhood, and the quiet complexities of everyday relationships- often leaving audiences feeling seen, heard, and understood.\n\nOver the years, she has taken her words from intimate beginnings to live stages, opening for renowned artists and performing across multiple platforms. With a style that blends vulnerability and strength, Nehal’s performances feel both personal and powerful.\n\nThrough every piece, she creates a space where emotions are not just expressed, but deeply experienced.", 
    genreName: "Story Telling",
    avatarUrl: "https://drive.google.com/drive/folders/1gyN3xep3dLM54wITCUmIg3OomtwqmLfE?usp=drive_link",
  }, 
  { 
    name: "Pragati Bachhawat", 
    bio: "Pragati Bachhawat is the author of Maun Seeta Kee Ramayan, her debut poetry book that portrays eighteen prominent characters from the Ramayan through the author’s unique perspective. The book blends prose and poetry and is complemented by expressive illustrations created by an illustrator, ensuring an authentic representation of each character’s emotions.\nThe book was recognised as a “fast-selling” title at the Notion Press stall during the International Delhi Book Fair 2025.\n\nHer work has also been featured in the anthology 7575 Poems in a Book, published by ESN Publications and recognised by the India Book of Records (2022). In addition, her poetry appeared in the anthology 1111 Poems in One Book, published by the London Book of Records (2021).\n\nHer Hindi translation work Parakram Aur Parampara was published in 2023. Pragati Bachhawat is also a stage performer known for storytelling and poetry recitals.", 
    genreName: "Poetry",
    avatarUrl: "https://drive.google.com/drive/folders/1xLvk7C8S6awniTNOB14_kl807dzOtJys?usp=drive_link",
  }, 
  { 
    name: "Suchhee aka Sakhiii", 
    bio: "Suchi Bansal lives life with a singular mission: to explore everything it has to offer. A Chartered Accountant by day and a storyteller at heart, she is a Financial Analyst who balances the structured world of numbers with a fearless pursuit of creative and spiritual growth. Rather than choosing a single path, Suchi embraces a multi-passionate life as a poet, storyteller, and aspiring author. She actively explores the arts through Hindustani classical music and classical Kathak dance, and as an avid traveler, she uses her journeys to deeply understand diverse perspectives. Ultimately, she blends logic and artistry to constantly expand her horizons as both a human being and a creator. The latest colour to her vision is finding Arturee—a dream she intends to paint the art world with!", 
    genreName: "Story Telling",
    avatarUrl: null,
  }, 
  { 
    name: "Able Nari by Phullo Begum", 
    bio: "Phullo Begum is an award-winning trained theatre artist, storyteller, podcaster, corporate trainer and creator behind Able Nari, recognized as Super Woman 2020. A former CSO at Platocast, she has produced 30+ podcast shows, mentored 50+ podcasters, and collaborated with platforms such as Arre Voice, Pocket FM, and Bizgurukul. Her creative journey spans podcasting, short films selected at Cannes, and international children's festivals. Through humour, poetry, satire, and relatable storytelling, she explores the many layers of womanhood, relationships, motherhood, work, identity, and self-respect. Able Nari is her mission to challenge stereotypes and replace the word \"Abla\" with \"Able\"—celebrating women not as labels, but as capable, complex, and complete human beings.", 
    genreName: "Story Telling",
    avatarUrl: "https://drive.google.com/drive/folders/1yVcgiRX8sU-MsYjcBD33yj-JiqRTWRkz?usp=drive_link",
  }, 
  { 
    name: "Author Anjali Jain", 
    bio: "Author Anjali Jain is a curious writer; her words are both sword and shield. She believes:\n“Ik lahar hu — kabhi shant, kabhi toofani; jitni chanchal utni hi gehri.”\nApart from writing, the only thing she truly enjoys is breathing.", 
    genreName: "Story Telling",
    avatarUrl: "https://drive.google.com/drive/folders/15QGwWJ2DLiOgovZFt8L3B6pFDOB4eySa?usp=drive_link",
  }, 
  { 
    name: "Tumhari Naina", 
    bio: "I am Naina an artist who collects little things, unfinished thoughts, fleeting moments, people, places and feelings that often go unnoticed. I write what I cannot always say and paint what words fail to hold.\nFor me art is not something I go looking for. It’s something that finds me..", 
    genreName: "Poetry",
    avatarUrl: null,
  }
];

// -----------------------------
// Videos
// -----------------------------
const videosData = [
  {
    artistName: "Nehal Bhanushali",
    title: "Mogambo Khush Hua",
    description: "All her life, she believed in one thing-\n\n“One day, everything will finally make sense.”\n\nSo she chased it. Through marks, milestones, expectations, love, and the idea of a “perfect life.” And on paper, she got there.\n\nBut why did it still feel… incomplete?\n\nMogambo Khush Hua is a deeply personal, relatable journey of a woman questioning everything she thought happiness would look like.\n\nAnd just when she thinks she’s finally close to that “one day”...\nsomething shifts-\nin a way she never saw coming.",
    url: "https://drive.google.com/file/d/13Y6Gl2MIE5sl7BeETQHNBLcyfH66yX-i/view?usp=drive_link",
    thumbnailUrl: "https://drive.google.com/file/d/1rFBnt9VmfhhrQ6SUDelfcqBe--DWxBZ0/view?usp=drivesdk",
    genreName: "Story Telling",
    tags: ["Poetry", "Spoken Word", "Womanhood", "Dreams", "Pursuit", "Happiness", "social cause", "indian story telling"],
    isPaid: true
  },
  {
    artistName: "Pragati Bachhawat",
    title: "Dupatta",
    description: "Dupatta is a free verse poem that expresses the societal pressures faced by men and women",
    url: "https://drive.google.com/file/d/1YUJ4lC1y_rJnKy1TrSp0CsgIRJwfD8UJ/view?usp=drive_link",
    thumbnailUrl: "https://drive.google.com/file/d/1qusW0eizfC2rtYb1wOXMZdNjjSBzlRGo/view?usp=drivesdk",
    genreName: "Poetry",
    tags: ["Poetry Recitation", "Mental health", "emotional drama", "spoken word", "indian poetry", "social cause", "male", "dupatta"],
    isPaid: true
  },
  {
    artistName: "Pragati Bachhawat",
    title: "Reunion",
    description: "A humorous short story of childhood friends who have a reunion years later and reminisce about their childhood stories, particularly one of embarrassment.",
    url: "https://drive.google.com/file/d/1YUJ4lC1y_rJnKy1TrSp0CsgIRJwfD8UJ/view?usp=drive_link",
    thumbnailUrl: "",
    genreName: "Story Telling",
    tags: ["Poetry", "Spoken Word", "friendship", "reunion", "love", "social cause", "indian story telling", "humour"],
    isPaid: true
  },
  {
    artistName: "Suchhee aka Sakhiii",
    title: "MeenaBai Kahanikaar",
    description: "MeenaBai Kahanikaar is a one of it's kind unique and innovative fictional storytelling show which was launched in Mumbai on 9th April 2023. It's a treat to watch where you can leave all your worries behind and just BE in the moment\n\nThis journey will take you through a roller coaster of emotions of day to day life and leave you with a huge smile along with thought provoking reality of today's world",
    url: "https://drive.google.com/file/d/1QgTedmoP8eadBR5jaF9O-3FAl_k8SdIi/view?usp=drive_link",
    thumbnailUrl: "",
    genreName: "Story Telling",
    tags: ["Poetry", "Ghazal", "Spoken Word", "Womanhood", "Prostitute's Life Journey", "Choices", "freedom", "social cause", "indian story telling", "Life", "love", "society"],
    isPaid: true
  },
  {
    artistName: "Able Nari by Phullo Begum",
    title: "Abhi Nahi, jab wo hoga tab!",
    description: "How often do we postpone our dreams, waiting to be more prepared, more confident, more perfect? \"Abhi Nahi, Yahin\" is a gentle reminder that ability does not require perfect timing. Through a candid moment in a night suit, this piece explores the quiet strength of women who keep showing up despite self-doubt, unfinished plans, and life's daily demands. Because sometimes courage is not about being ready—it is about being present.",
    url: "https://drive.google.com/file/d/1HP_yL4oJBHoDrXFPqo0nrTfHFgyhGK6B/view?usp=drive_link",
    thumbnailUrl: "",
    genreName: "Story Telling",
    tags: ["Poetry", "Spoken Word", "Womanhood", "Dreams", "Pursuit", "Happiness", "social cause", "indian story telling", "self doubt", "challenging", "candid"],
    isPaid: true
  },
  {
    artistName: "Able Nari by Phullo Begum",
    title: "Generational Bias in Corporate",
    description: "What happens when a Gen Z mindset meets old-school wisdom in a startup? Between dress codes, work styles, hierarchy, flexibility, and the famous \"hamare zamaane mein...\", misunderstandings are bound to happen. But is this really a battle of generations, or simply two people trying to make sense of a changing world? Through humour and observation, this piece explores how respect, capability, and ownership matter far more than age, titles, or trends.",
    url: "https://drive.google.com/file/d/1HP_yL4oJBHoDrXFPqo0nrTfHFgyhGK6B/view?usp=drive_link",
    thumbnailUrl: "",
    genreName: "Story Telling",
    tags: ["Poetry", "Spoken Word", "Womanhood", "Dreams", "Pursuit", "Happiness", "social cause", "indian story telling", "Coporate bias", "old school", "start up", "world view"],
    isPaid: true
  },
  {
    artistName: "Able Nari by Phullo Begum",
    title: "Mumma Boy Alert",
    description: "What happens when a prospective bride is assessed like a product and English becomes a status test? \"Mumma Boy Alert\" is a humorous take on the modern marriage market, where personalities are measured, assumptions are made, and compatibility sometimes gets lost in the interview process. Told through wit, satire, and a healthy dose of self-respect, this piece reminds us that confidence is not found in perfect grammar but in knowing your own worth.\n\nOne line Teaser: English bol leti hoon. Par zyada zaroori cheez bolti hoon, self-respect.",
    url: "https://drive.google.com/file/d/1HP_yL4oJBHoDrXFPqo0nrTfHFgyhGK6B/view?usp=drive_link",
    thumbnailUrl: "",
    genreName: "Story Telling",
    tags: [],
    isPaid: false
  },
  {
    artistName: "Author Anjali Jain",
    title: "Jaise Papa, Vaisi Beti | My Marwadi Dad Vs. The Touchscreen",
    description: "9-year-old Anjali has one obsession: upgrading her father’s ancient \"dabba\" phone to a shiny new touchscreen. But her stubborn Marwadi dad hates change. Will a heavy rainstorm and a stubborn fever finally bridge the gap between old-school values and a daughter's dream?\n\nWhen a stubborn 9-year-old goes to war with her even more stubborn father over a touchscreen phone, a rainy day changes their bond forever.",
    url: "https://drive.google.com/file/d/1nRHuMpAFUKS3-MqSe9WOEAfvAPA3B0Vx/view?usp=drive_link",
    thumbnailUrl: "",
    genreName: "Story Telling",
    tags: ["Father daughter story", "Nostalgia storytelling", "90s kids memory", "Touchscreen phone nostalgia", "Heartwarming Hindi story", "Relatable family drama", "Slice of life"],
    isPaid: true
  },
  {
    artistName: "Tumhari Naina",
    title: "आख़िरी अदालत और राख का आसमान",
    description: "",
    url: "",
    thumbnailUrl: "",
    genreName: "",
    tags: [],
    isPaid: false
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({ email: 'admin@arturee.com' }); // optionally clear admin
    await Artist.deleteMany({});
    await Genre.deleteMany({});
    await Video.deleteMany({});
    console.log("Existing artists, genres, and videos deleted.");

    // Create Admin User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("Arturee@232802", salt);
    
    let admin = await User.findOne({ email: 'admin@arturee.com' });
    if (!admin) {
      admin = new User({
        name: "Admin",
        email: "admin@arturee.com",
        password: hashedPassword,
        role: "admin",
        isEmailVerified: true
      });
      await admin.save();
      console.log("Admin user created: admin@arturee.com");
    }

    // Insert Genres
    const insertedGenres = await Genre.insertMany(genres);
    const genreMap = {};
    insertedGenres.forEach((g) => {
      genreMap[g.name] = g._id;
    });
    console.log(`Inserted ${insertedGenres.length} genres.`);

    // Replace genre names with ObjectIds
    const artistDocs = artistsData.map((artist) => ({
      ...artist,
      genre: genreMap[artist.genreName],
      followerCount: 0,
      videoCount: 0,
      isActive: true,
      isVerified: true,
    }));
    const insertedArtists = await Artist.insertMany(artistDocs);
    const artistMap = {};
    insertedArtists.forEach((a) => {
      artistMap[a.name] = a._id;
    });
    console.log(`Inserted ${artistDocs.length} artists.`);

    // Insert Videos
    const videoDocs = videosData.filter(v => v.title).map(data => ({
      title: data.title,
      description: data.description,
      thumbnailUrl: data.thumbnailUrl,
      creatorId: admin._id,
      price: data.isPaid ? 99 : 0,
      tags: data.tags,
      genre: genreMap[data.genreName] || null,
      videoSource: 'youtube',
      youtubeUrl: data.url,
      status: 'youtube',
      isPublished: true,
      artistId: artistMap[data.artistName] || null
    }));
    await Video.insertMany(videoDocs);
    console.log(`Inserted ${videoDocs.length} videos.`);

    console.log("Seed completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();
