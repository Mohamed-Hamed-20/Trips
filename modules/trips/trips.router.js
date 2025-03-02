import { Router } from "express";
import {
  addTrip,
  deleteTrip,
  getAllTrips,
  getTripById,
  updateTrip,
} from "./controller/trips.controller.js";
import { validation } from "../../middleware/validation.js";
import {
  addTripSchema,
  getByIdSchema,
  updateTripSchema,
} from "./trips.validation.js";
import { fileValidation, HME, myMulter } from "../../services/multer.js";
import { endPoints } from "./trips.endPoint.js";
import { auth } from "../../middleware/auth.js";
import wishList from "../wishlist/wishlist.router.js";

const tripRoutes = Router();

tripRoutes.use("/wishlist", wishList);

tripRoutes
  .route("/")
  .get(auth(endPoints.all), getAllTrips)

tripRoutes
  .route("/:id")
  .get(auth(endPoints.all), validation(getByIdSchema), getTripById)
  .patch(
    auth(endPoints.add),
    myMulter(fileValidation.image).array("images", 7),
    HME,
    validation(updateTripSchema),
    updateTrip
  )
  .delete(auth(endPoints.add), validation(getByIdSchema), deleteTrip)
  .post(
    auth(endPoints.add),
    validation(addTripSchema),
    myMulter(fileValidation.image).array("images", 7),
    HME,
    addTrip
  );

export default tripRoutes;
