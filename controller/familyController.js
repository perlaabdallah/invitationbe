import Family from "../model/familyModel.js";
import mongoose from "mongoose";

export const createFamily = async (req, res) => {
  try {
    const newFamily = new Family(req.body);
    const savedData = await newFamily.save();
    res.status(200).json(savedData);
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

export const getFamilyByFamilyId = async (req, res) => {
  try {
    const familyId = req.params.familyId;
    console.log("Looking for family with ID:", familyId);
    console.log("ID length:", familyId.length);
    console.log("ID type:", typeof familyId);
    
    // Validate MongoDB ObjectId format
    const isValid = mongoose.Types.ObjectId.isValid(familyId);
    console.log("Is valid ObjectId:", isValid);
    
    if (!isValid) {
      return res.status(400).json({ errorMessage: "Invalid family ID format." });
    }
    
    // Try to create ObjectId explicitly
    let objectId;
    try {
      objectId = new mongoose.Types.ObjectId(familyId);
      console.log("Created ObjectId:", objectId);
    } catch (err) {
      console.log("ObjectId creation failed:", err.message);
      return res.status(400).json({ errorMessage: "Invalid family ID format." });
    }
    
    const familyData = await Family.findById(objectId);
    console.log("Found family data:", familyData);
    
    if (!familyData) {
      // Try alternative query methods for debugging
      const allFamilies = await Family.find().limit(5);
      console.log("Sample families in DB:", allFamilies.map(f => ({ id: f._id, attendeesCount: f.attendees?.length })));
      
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
    const familyId = req.params.familyId;
    const { attendees, giftRegistry } = req.body;

    // Check if familyId is provided and valid
    if (familyId && mongoose.Types.ObjectId.isValid(familyId)) {
      // Check if family exists
      let familyData = await Family.findById(familyId);

      if (familyData) {
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
    }

    // Create new family if it doesn't exist or invalid ID
    const newFamily = new Family({
      attendees: attendees || [],
      giftRegistry: giftRegistry || false,
    });
    const savedData = await newFamily.save();
    return res.status(201).json(savedData);
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};

export const updateFamilyByFamilyId = async (req, res) => {
  try {
    const familyId = req.params.familyId;
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(familyId)) {
      return res.status(400).json({ errorMessage: "Invalid family ID format." });
    }
    
    const familyData = await Family.findById(familyId);
    if (!familyData) {
      return res.status(404).json({ errorMessage: "Family data not found." });
    }
    
    const updatedData = await Family.findByIdAndUpdate(familyId, req.body, {
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
    console.log("Family model:", Family.modelName);
    console.log("Collection name:", Family.collection.name);
    
    const familyData = await Family.find();
    console.log("Family data found:", familyData);
    console.log("Number of families:", familyData ? familyData.length : 0);
    
    // Show first family details for debugging
    if (familyData && familyData.length > 0) {
      console.log("First family _id:", familyData[0]._id);
      console.log("First family _id type:", typeof familyData[0]._id);
      console.log("First family _id string:", familyData[0]._id.toString());
    }
    
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
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(familyId)) {
      return res.status(400).json({ errorMessage: "Invalid family ID format." });
    }
    
    const familyData = await Family.findById(familyId);
    if (!familyData) {
      return res.status(404).json({ errorMessage: "Family data not found." });
    }
    
    await Family.findByIdAndDelete(familyId);
    return res.status(200).json({ message: "Family deleted successfully" });
  } catch (error) {
    res.status(500).json({ errorMessage: error.message });
  }
};
