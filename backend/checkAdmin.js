import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const db = mongoose.connection.db;
    const users = await db.collection('users').find({ role: 'admin' }).toArray();
    console.log("Admin users in DB:", users.map(u => ({ email: u.email, role: u.role })));
    const allUsers = await db.collection('users').find({}).toArray();
    console.log("All users:", allUsers.map(u => ({ email: u.email, role: u.role })));
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
