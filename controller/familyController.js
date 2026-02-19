import Family from "../model/familyModel.js";

export const createFamily = async (req, res) => {
  try {
    const newFamily = new Family(req.body);
    const { familyId } = newFamily;
    const familyExists = await Family.findOne({ familyId });
    if (familyExists) {
      return res.status(400).json({ message: "Family already exists." });
    }
    const savedData = await newFamily.save();
    res.status(200).json(savedData);
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

export const getFamilyByFamilyId = async (req, res) => {
  try {
    const familyId = req.params.familyId;
    const familyData = await Family.findOne({ familyId });
    if (!familyData) {
      res.status(404).json({ errorMessage: "Family data not found." });
    }
    return res.status(200).json(familyData);
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

export const postByFamilyId = async (req, res) => {
  try {
    const familyId = req.params.familyId;
    const { attendees, giftRegistry } = req.body;

    // Check if family exists
    let familyData = await Family.findOne({ familyId });

    if (!familyData) {
      // Create new family if it doesn't exist
      const newFamily = new Family({
        familyId,
        attendees: attendees || [],
        giftRegistry: giftRegistry || false,
      });
      const savedData = await newFamily.save();
      return res.status(201).json(savedData);
    } else {
      // Add attendees to existing family
      if (attendees && attendees.length > 0) {
        familyData.attendees.push(...attendees);
        if (giftRegistry !== undefined) {
          familyData.giftRegistry = giftRegistry;
        }
        const updatedData = await familyData.save();
        return res.status(200).json(updatedData);
      }
      return res.status(400).json({ message: "No attendees provided to add." });
    }
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

export const updateFamilyByFamilyId = async (req, res) => {
  try {
    const familyId = req.params.familyId;
    const familyData = await Family.findOne({ familyId });
    if (!familyData) {
      return res.status(404).json({ errorMessage: "Family data not found." });
    }
    const updatedData = await Family.findOneAndUpdate({ familyId }, req.body, {
      new: true,
    });
    return res.status(200).json(updatedData);
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

export const getAllFamilies = async (req, res) => {
  try {
    const familyData = await Family.find();
    if (!familyData || familyData.length === 0) {
      res.status(404).json({ errorMessage: "No family data found." });
    }
    return res.status(200).json(familyData);
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

export const deleteFamilyByFamilyId = async (req, res) => {
  try {
    const familyId = req.params.familyId;
    const familyData = await Family.findOne({ familyId });
    if (!familyData) {
      return res.status(404).json({ errorMessage: "Family data not found." });
    }
    await Family.findOneAndDelete({ familyId });
    return res.status(200).json({ message: "Family deleted successfully" });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};
