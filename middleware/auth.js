import jwt from 'jsonwebtoken'
import userModel from '../DB/model/user.model.js';
import { asyncHandler } from '../services/asyncHandler.js';


export const auth = () => {
    return asyncHandler(async (req, res, next) => {
        // try {
        console.log({ bb: req.body });
        const { authorization } = req.headers
        const token = authorization.split(" ")[1]
        
        const decoded = jwt.verify(token, process.env.tokenSignature);
        
        if (!decoded?.id || !decoded?.isLoggedIn) {
            // res.status(400).json({ message: "In-valid token payload " })
            next(new Error("Invalid token payload ", { cause: 400 }))
        } else {
            const user = await userModel.findById(decoded.id).select('email userName role')
            if (!user) {
                // res.status(404).json({ message: "Not register user" })
                next(new Error("Not register user ", { cause: 404 }))

            } else {
                req.user = user;
                req.userId = user._id;
                next()
            }
        }
    })
}