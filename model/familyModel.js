import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const familySchema = new mongoose.Schema({
  familyId: {
    type: String,
    required: true,
    unique: true,
    default: uuidv4,
  },
  attendees: [
    {
      guestId: {
        type: Number,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      attending: {
        type: Boolean,
        required: true,
      },
    },
  ],
  giftRegistry: {
    type: Boolean,
    required: false,
    default: false,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
});

export default mongoose.model("Family", familySchema);
