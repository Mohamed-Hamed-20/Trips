import { Router } from "express";
import { auth } from "../../middleware/auth.js";
import { endPoints } from "./category.endPoint.js";
import * as categoryController from "./controller/category.controller.js";
const router = Router();

router.post(
  "/add",
  auth(endPoints.addCategory),
  categoryController.addCategory
);
router.get("/all", auth(endPoints.addCategory), categoryController.categories);
router.get(
  "/:categoryId",
  auth(endPoints.addCategory),
  categoryController.getCategoryById
);
router.put(
  "/update/:id",
  auth(endPoints.updateCategory),
  categoryController.updateCategory
);

export default router;
