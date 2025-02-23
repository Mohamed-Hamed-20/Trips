import Joi from "joi";

export const signUpValidation = {
    body: Joi.object().required().keys({
        name: Joi.string().min(3).max(30).required(),
        email: Joi.string().email(),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{8,30}$')),
        cPassword: Joi.string().valid(Joi.ref("password")).required()
    })
}

