import express from "express";
import {
  create,
  getAllGuests,
  getGuestsByGuestID,
  updateGuestById,
  deleteGuestById,
  deleteGuestByGuestId,
} from "../controller/guestController.js";

const route = express.Router();

route.post("/guest", create);
route.get("/guests", getAllGuests);
route.get("/guestsById/:id", getGuestsByGuestID);
route.put("/update/guest/:id", updateGuestById);
route.delete("/delete/guest/:id", deleteGuestById);
route.delete("/delete/guests/:guestId", deleteGuestByGuestId);
export default route;
