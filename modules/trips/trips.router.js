import { Router } from "express";
import {
  addTrip,
  deleteTrip,
  getAlltrips,
  getAlltripsById,
  updateTrip,
} from "./controller/trips.controller.js";
import { validation } from "../../middleware/validation.js";
import {
  addTripSchema,
  getByIdSchema,
  updateTripSchema
} from './trips.validation.js'
import { fileValidation, HME, myMulter } from "../../services/multer.js";
import { endPoints } from "./trips.endPoint.js";
import { auth } from "../../middleware/auth.js";



const tripRoutes = Router();

tripRoutes
  .route("/")
  .get(auth(endPoints.all),getAlltrips)
  .post(
    auth(endPoints.add),
    validation(addTripSchema),
    myMulter(fileValidation.image).array("images",7),HME,
    addTrip
  )


tripRoutes
  .route("/:id")
  .get(auth(endPoints.all),validation(getByIdSchema), getAlltripsById)
  .patch(
    auth(endPoints.add),
    myMulter(fileValidation.image).array("images",7),HME,
    validation(updateTripSchema),
    updateTrip
  )
  .delete(auth(endPoints.add),validation(getByIdSchema), deleteTrip);

export default tripRoutes;