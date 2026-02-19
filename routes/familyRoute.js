import express from "express";
import {
  createFamily,
  deleteFamilyByFamilyId,
  getAllFamilies,
  getFamilyByFamilyId,
  postByFamilyId,
  updateFamilyByFamilyId,
} from "../controller/familyController.js";

const familyRoute = express.Router();

// POST - Create new family
familyRoute.post("/", createFamily);

// GET - Get all families
familyRoute.get("/all", getAllFamilies);

// GET - Get family by familyId
familyRoute.get("/:familyId", getFamilyByFamilyId);

// POST - Add attendees to family by familyId or create if doesn't exist
familyRoute.post("/post/:familyId", postByFamilyId);

// PUT - Update family by familyId
familyRoute.put("/update/:familyId", updateFamilyByFamilyId);

// DELETE - Delete family by familyId
familyRoute.delete("/delete/:familyId", deleteFamilyByFamilyId);

export default familyRoute;
