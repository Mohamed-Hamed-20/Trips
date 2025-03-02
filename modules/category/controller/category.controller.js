import { create, find, findById, findByIdAndUpdate } from "../../../DB/DBMethods.js"
import categoryModel from "../../../DB/model/category.model.js"
import { asyncHandler } from "../../../services/asyncHandler.js"

export const addCategory = asyncHandler(async (req, res, next) => {
        let { name } = req.body;
        const result = await create({ model: categoryModel, data: { name, createdBy: req.user._id } })
        res.status(201).json({ message: "Created", result })
})

export const updateCategory = asyncHandler(async (req, res, next) => {
    let { id } = req.params
    let { name } = req.body
    let category = await findById({ model: categoryModel, id: id })
    if (!category) {
        next(new Error("category not found", { cause: 404 }))
    } else {
        let updated = await findByIdAndUpdate({ model: categoryModel, condition: { _id: id }, data: { name}, options: { new: true } })
        res.status(200).json({ message: "Updated", updated })
    }

})

export const categories = asyncHandler(async (req, res, next) => {

    let allCategories = await find({ model: categoryModel })

    res.status(200).json({ message: " Done", allCategories })

})

export const getCategoryById = asyncHandler(async (req, res, next) => {
    let { categoryId } = req.params

    let category = await findById({ model: categoryModel, id: categoryId })
    if (!category) {
        next(new Error("invalid category", { cause: 404 }))
    } else {
        res.status(200).json({ message: " Done", category })
    }
})