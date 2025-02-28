import userModel from "../../DB/model/user.model.js";
import bcryptjs from "bcryptjs";
export const changePassword = async (req,res)=>{
    try{
        const {currentPassword , newPassword} = req.body;
        const {userId} = req;
        const {password} = await userModel.findById(userId);
        console.log(password);
        const decode = bcryptjs.compareSync(currentPassword , password);
        if(!decode){
            return res.status(400).json({status: "Failed" , error: "password is wrong"});
        }
        const hashPass = bcryptjs.hashSync(newPassword , +process.env.SALTROUND);
        const updatePass = await userModel.findByIdAndUpdate(userId , {
            password: hashPass
        } , {new: true});
        res.status(200).json({status:"success" , data: "password is updated successfully"});
    }
    catch(err){
        res.status(400).json({status: "Failed" , error: err})
    }
}

export const deleteAccount = async(req,res)=>{
    try{
        const {userId} = req;
        const user = await userModel.findByIdAndDelete(userId);
        if(!user){
            return res.status(400).json({status: "Something went wrong during db action"})
        }
        res.status(200).json({status: "success" , data: "Account deleted successfully"});
    }
    catch(err){
        res.status(400).json({"status":"Failed" , error: err});
    }
}