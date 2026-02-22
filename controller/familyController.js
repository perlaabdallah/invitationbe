import Family from "../model/familyModel.js";
import { v4 as uuidv4 } from "uuid";

export const createFamily = async (req, res) => {
  try {
    // Generate UUID if not provided
    const familyId = req.body.familyId || uuidv4();
    
    const newFamily = new Family({
      ...req.body,
      familyId,
    });
    
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
    console.log("Looking for family with UUID:", familyId);
    
    // Validate UUID format (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(familyId)) {
      return res.status(400).json({ errorMessage: "Invalid family ID format." });
    }
    
    const familyData = await Family.findOne({ familyId });
    console.log("Found family data:", familyData);
    
    if (!familyData) {
      return res.status(404).json({ errorMessage: "Family data not found." });
    }
    return res.status(200).json(familyData);
  } catch (error) {
    console.error("Error in getFamilyByFamilyId:", error);
    res.status(500).json({ errorMessage: error.message });
  }
};

export const postByFamilyId = async (req, res) => {
  try {
    let familyId = req.params.familyId;
    const { attendees, giftRegistry } = req.body;

    // If no familyId provided or invalid, generate new UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!familyId || !uuidRegex.test(familyId)) {
      familyId = uuidv4();
    }

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
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(familyId)) {
      return res.status(400).json({ errorMessage: "Invalid family ID format." });
    }
    
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
    console.log("Getting all families...");
    const familyData = await Family.find();
    console.log("Family data found:", familyData);
    console.log("Number of families:", familyData ? familyData.length : 0);
    
    if (!familyData || familyData.length === 0) {
      return res.status(404).json({ errorMessage: "No family data found." });
    }
    return res.status(200).json(familyData);
  } catch (error) {
    console.error("Error in getAllFamilies:", error);
    res.status(500).json({ errorMessage: error.message });
  }
};

export const deleteFamilyByFamilyId = async (req, res) => {
  try {
    const familyId = req.params.familyId;
    
    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(familyId)) {
      return res.status(400).json({ errorMessage: "Invalid family ID format." });
    }
    
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
