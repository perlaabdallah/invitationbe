import Guest from "../model/guestModel.js";

export const create = async (req, res) => {
  try {
    const newGuest = new Guest(req.body);
    const { name } = newGuest;
    const guestExists = await Guest.findOne({ name });
    if (guestExists) {
      return res.status(400).json({ message: "Guest already exists." });
    }
    const savedData = await newGuest.save();
    res.status(200).json(savedData);
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

export const getGuestsByGuestID = async (req, res) => {
  try {
    const guestId = req.params.id;
    const guestData = await Guest.find({ guestId });
    if (!guestData || guestData.length === 0) {
      return res.status(404).json({ errorMessage: "Guest data not found." });
    }
    return res.status(200).json(guestData);
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

export const getAllGuests = async (req, res) => {
  try {
    const guestData = await Guest.find();
    if (!guestData || guestData.length === 0) {
      return res.status(404).json({ errorMessage: "Guest data not found." });
    }
    return res.status(200).json(guestData);
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

export const updateGuestById = async (req, res) => {
  try {
    const id = req.params.id;
    const guestData = await Guest.findById(id);
    if (!guestData) {
      return res.status(404).json({ errorMessage: "Guest data not found." });
    }
    const updatedData = await Guest.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    return res.status(200).json(updatedData);
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

export const deleteGuestById = async (req, res) => {
  try {
    const id = req.params.id;
    const guestData = await Guest.findById(id);
    if (!guestData) {
      return res.status(404).json({ errorMessage: "Guest data not found." });
    }
    await Guest.findByIdAndDelete(id);
    return res.status(200).json({ message: "Guest deleted successfully" });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

export const deleteGuestByGuestId = async (req, res) => {
  try {
    const guestId = req.params.guestId;
    const guestData = await Guest.find({ guestId });
    if (!guestData || guestData.length === 0) {
      return res.status(404).json({ errorMessage: "Guest data not found." });
    }
    await Guest.deleteMany({ guestId });
    return res.status(200).json({ message: "Guests deleted successfully" });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};
