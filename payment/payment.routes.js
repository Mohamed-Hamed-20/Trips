import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
const __dirname = path.dirname(fileURLToPath(import.meta.url)); 
dotenv.config({ path: path.resolve(__dirname, "../config/.env") }); 
import {Router} from "express";
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const paymentRoutes = Router();


paymentRoutes.get("/" , (req,res)=>{
    res.render('index.ejs')
})
paymentRoutes.get("/cancel" , (req,res)=>{ 
  res.render("cancel.ejs")
})
paymentRoutes.get("/success" , (req,res)=>{
  res.render("success.ejs")
})
paymentRoutes.post("/checkout" , async (req,res)=>{
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data:{
                currency: 'usd',
                product_data: {
                    name: "Node js course"
                },
                unit_amount: 130 * 100,
            },
            quantity: 1
            },
        ],
        mode: "payment",
        success_url: "http://localhost:3000/api/v1/payment/success",
        cancel_url: "http://localhost:3000/api/v1/payment/cancel"
    })

    console.log(session);
    res.redirect(session.url)

})

export default paymentRoutes; 