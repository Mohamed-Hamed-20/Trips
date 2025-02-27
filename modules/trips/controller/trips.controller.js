import tripModel from "../../../DB/model/trip.model.js";
import { asyncHandler } from "../../../services/asyncHandler.js";
import slugify from "slugify";
import cloudinary from "../../../services/cloudinary.js";
import ApiFeatures from "../../../Utiletis/apiFeatures.js";

export const addTrip = asyncHandler(async (req, res, next) => {
  if (!req.files?.length) {
    next(new Error("You have to add images", { cause: 400 }));
  } else {
    req.body.slug = slugify(req.body.title);
    req.body.createdBy = req.user._id;

    let imagesUrl = [];
    let imageIds = [];
    for (const file of req.files) {
      let { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        { folder: "2025/trips" }
      );
      imagesUrl.push(secure_url);
      imageIds.push(public_id);
    }
    req.body.images = imagesUrl;
    req.body.publicImageIds = imageIds;

    const trip = await tripModel.create(req.body);
    const responseTrip = trip.toObject();
    delete responseTrip.__v;

    if (!trip) {
      for (const id of imageIds) {
        await cloudinary.uploader.destroy(id);
      }
      next(new Error("Error while inserting to DB", { cause: 400 }));
    } else {
      res.status(201).json({ message: "Success", responseTrip });
    }
  }
});

export const getAlltrips = asyncHandler(async (req, res, next) => {
  let api = new ApiFeatures(tripModel.find(), req.query);
  let allTrips = await tripModel.find();
  res.json({ message: "Success", allTrips });
});

export const getAlltripsById = asyncHandler(async (req, res, next) => {
  try {
    const trip = await tripModel.findById(req.params.id);

    if (!trip) {
      const error = new Error("Trip not found");
      error.cause = 404;
      throw error;
    }

    res.json({ message: "Success", trip });
  } catch (error) {
    if (!error.cause) error.cause = 500;
    next(error);
  }
});

export const updateTrip = asyncHandler(async (req, res, next) => {
  const trip = await tripModel.findById(req.params.id);

  if (!trip) {
    return next(new Error("Trip not found", { cause: 404 }));
  }

  const newImages = [];
  const imagesToDelete = [];

  try {
    if (req.files?.length) {
      for (const file of req.files) {
        const { secure_url, public_id } = await cloudinary.uploader.upload(
          file.path,
          { folder: "2025/trips" }
        );
        trip.images.push(secure_url);
        trip.publicImageIds.push(public_id);
        newImages.push(public_id);
      }
    }

    if (req.body.deletedImageIds?.length) {
      const validDeletedIds = trip.publicImageIds.filter((id) =>
        req.body.deletedImageIds.includes(id)
      );

      validDeletedIds.forEach((id) => {
        const index = trip.publicImageIds.indexOf(id);
        if (index > -1) {
          trip.publicImageIds.splice(index, 1);
          trip.images.splice(index, 1);
          imagesToDelete.push(id);
        }
      });
    }

    if (req.body.title) {
      req.body.slug = slugify(req.body.title);
    }
    Object.assign(trip, req.body);

    const updatedTrip = await trip.save();
    const responseTrip = updatedTrip.toObject();
    delete responseTrip.__v;

    if (imagesToDelete.length) {
      await Promise.all(
        imagesToDelete.map((id) => cloudinary.uploader.destroy(id))
      );
    }

    res.status(200).json({ message: "Success", responseTrip });
  } catch (error) {
    if (newImages.length) {
      await Promise.all(newImages.map((id) => cloudinary.uploader.destroy(id)));
    }
    return next(new Error(error.message || "Update failed", { cause: 400 }));
  }
});

export const deleteTrip = asyncHandler(async (req, res, next) => {
  try {
    const trip = await tripModel.findByIdAndDelete(req.params.id);

    if (!trip) {
      const error = new Error("Trip not found");
      error.cause = 404;
      throw error;
    }

    res.status(200).json({ message: "Success" });
  } catch (error) {
    if (!error.cause) error.cause = 500;
    next(error);
  }
});
