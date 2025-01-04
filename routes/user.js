import express from 'express';
import passport from '../passport-config.js';
import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import { jswSecret } from '../passport-config.js';
import Token from '../models/token.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import verifyEmail from '../verifyEmail.js';
import nodemailer from 'nodemailer';
import checkPermission from '../middleware/checkPermission.js';

dotenv.config();

const router = express.Router()

// Nodmailer transport
const transporter = nodemailer.createTransport({
    service: "Gmail",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
        user: process.env.USER,
        pass: process.env.PASSWORD,
    },
  });

// POST Method's
router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        // Check if the user already exists
        const findUser = await User.findOne({ email });
        if (findUser) {
            return res.status(400).json('This user already exists!');
        }
        // Create a new user
        const newUser = new User({
            username: username.toLowerCase(),
            email : email.toLowerCase(),
            role: role.toLowerCase(),
            password
        });
        await newUser.save();

        console.log(newUser);
        

        const token = new Token ({
            userId: newUser.id,
            token: crypto.randomBytes(16).toString('hex')
        })

        await token.save()
        console.log(token);

        const link = `http://localhost:5000/user/v1/managment/users/confirm/${token.token}`
        await verifyEmail(newUser.email, link)
        res.status(200).json('Email send successfully!');

    } catch (err) {
        console.log(err);
        res.status(400).json('Error registering user!');
    }
});


router.post('/login', (req, res, next) => {
    req.body.username = req.body.username.toLowerCase(); // Normalize email
    passport.authenticate('local', { session: false })(req, res, next);
}, (req, res) => {
    const user = req.user;
    
    if (user.isVerifyEmail) {
        const token = jwt.sign({ id: user._id }, jswSecret, { expiresIn: '1h' });
        return res.json({ token });
    } 
    return res.status(400).json('Please Verify Your Email!');
});

// FORGOT PASSWORD

router.post('/forgot-password', async (req, res) => {
    const {email} = req.body;
    try{
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json('User not found!')
        }

        const token = crypto.randomBytes(16).toString('hex')
        user.token = token;
        await user.save();
        const info = await transporter.sendMail({
            from: process.env.USER, // sender address
            to: email, // list of receivers
            subject: "Password reset ✔", // Subject line
            text: "Please reset your password", // plain text body
            html: `<p>Click here to reset your password: <a href='http://localhost:5000/user/v1/managment/users/reset-password/${token}'> Reset password </a> <br>Thank you! </p>`, // html body
          });

          if (info.messageId) {
            res.status(200).json('message send successfully!')
          } else {
            res.status(500).json('error sending email!')
          }
    }catch(error){
        console.error(error);
    }
    
});


// handle reset password post requist
router.post('/reset-password', async (req, res) => {
    const {token, new_password, confirm_new_password} = req.body;
    
    try{

      const user = await User.findOne({token});
        if(new_password !== confirm_new_password){
            res.status(400).json("Password dosn't match!");
        }

        if(!user){
            return res.status(400).json('Invalid token');
        }
        
        user.password = new_password
        user.token = null;
        await user.save();
        res.status(200).json('Password reset successfully')
        // res.redirect('/login')

    }
    catch(error){
        console.error(error);
    }
})

// DELETE User
router.delete('/:id', passport.authenticate('jwt', { session: false }), checkPermission('DELETE'),  async (req, res) => {
    const {id} = req.params
    try{
        await User.findByIdAndDelete(id);
        res.status(200).json('User deleted successfully!')
    }
    catch(err){
        console.log(err);       
        res.status(400).json('Error deleting user!')
    }
})

// Update User
router.put('/:id',  async (req, res) => {
    const { id } = req.params;
    const updateData = { ...req.body };

    try {
        // Hash the password if it's being updated
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        // Normalize email
        if (updateData.username) {
            updateData.username = updateData.username.toLowerCase();
        }

        const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
        
        if (!updatedUser) {
            return res.status(404).json('User not found!');
        }

        // Check if the email was updated
        if (updateData.email !== updatedUser.email) {
            const token = new Token({
                userId: updatedUser.id,
                token: crypto.randomBytes(16).toString('hex')
            });

            await token.save();
            const link = `http://localhost:5000/user/v1/managment/users/confirm/${token.token}`;
            await verifyEmail(updatedUser.email, link);
            return res.status(200).json('Please check your email to update your data!');
        }

        return res.status(200).json('Updated successfully!');
        
    } catch (err) {
        console.log(err);
        return res.status(400).json('Error updating user!');
    }
});



// GET Method's
router.get('/', passport.authenticate('jwt', { session: false }), async (req, res) => {
    try{
        const getAllUsers = await User.find().populate('role');
        res.status(200).json(getAllUsers)
    }
    catch(err){
        console.log(err);       
        res.status(400).json('Error getting users!')
    }
})

router.get('/:id', async (req, res) => {
    const {id} = req.params
    try{
        const getOneUser = await User.findById(id);
        res.status(200).json(getOneUser)
    }
    catch(err){
        console.log(err);       
        res.status(400).json('Error getting user!')
    }
})

// reset password page routes
router.get('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const user = await User.findOne({ token })
    if (!user) {
        return res.status(200).json('add your new password')
        // return res.redirect('/forgot-password')
    }

    res.render('reset-password', {title: 'Reset Password Page', active: 'reset', token});
});

router.get('/confirm/:token', async (req, res) => {

    try{
        const token = await Token.findOne({token: req.params.token});
        console.log(token);
        await User.updateOne({_id: token.userId},{$set:{isVerifyEmail: true}});
        await Token.findByIdAndDelete(token._id)
        res.status(200).json('email verified seccussfully!')
    }
    catch(err){
        console.log(err);       
        res.status(400).json('Error verified email!')
    }
})

router.get('/protected', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.json({ message: 'This is a protected route', user: req.user });
});






export default router

