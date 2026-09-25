import mongoose from 'mongoose'

const specialtySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a specialty name'],
      unique: true,
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot be more than 200 characters']
    },
    icon: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
)

export default mongoose.models.Specialty || mongoose.model('Specialty', specialtySchema)
