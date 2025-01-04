import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();


const verifyEmail = async (email, link) => {
    try{
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
              user: process.env.USER,
              pass: process.env.PASSWORD,
            }
        });
        // Sened Mail
    const info = await transporter.sendMail({
                    from: process.env.USER, // sender address
                    to: email, // list of receivers
                    subject: "Account Verification ✔", // Subject line
                    text: "Welcome!", // plain text body
                    html: `<a href=${link}> Verify Your Email Here</a>`
                });
        console.log('Mail Send Successfully!');
                   
    }
    catch(err){
        console.log(err);        
    }
}


 export default verifyEmail;