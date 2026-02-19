import mongoose from "mongoose";

const familySchema = new mongoose.Schema({
  familyId: {
    type: String,
    required: true,
    unique: true,
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
  },
});

export default mongoose.model("Family", familySchema);
