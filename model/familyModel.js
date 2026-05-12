import mongoose from "mongoose";

const familySchema = new mongoose.Schema(
  {
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
          required: false,
        },
      },
    ],
    giftRegistry: {
      type: Boolean,
      required: false,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  },
);

export default mongoose.model("Family", familySchema);
