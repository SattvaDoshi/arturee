import mongoose from 'mongoose'

const deletionFeedbackSchema = new mongoose.Schema(
  {
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
)

const DeletionFeedback = mongoose.model('DeletionFeedback', deletionFeedbackSchema)
export default DeletionFeedback
