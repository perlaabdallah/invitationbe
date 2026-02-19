import mongoose from "mongoose";

const guestSchema = new mongoose.Schema({
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
  giftRegistry: {
    type: Boolean,
    required: false,
  },
});
export default mongoose.model("Guest", guestSchema);
