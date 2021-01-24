const express = require('express');
const app = express();
const User = require('../db/models/user');
const Task = require('../db/models/task');
const multer = require('multer')
const sharp = require('sharp')
const { sendWelcomeMail, sendCancelationMail} = require('../emails/account')

const userRouter = new express.Router();

// use auth middleware that we've created, we will use this middleware for routes that require the user to be authenticated first
const auth = require('../middleware/auth');
const { get } = require('mongoose');

// user routes
userRouter.post('/users', async (req, res)=>{
    const user = new User(req.body);

    try{
        await user.save();
        // this function will send an email to the user after they sign up
        sendWelcomeMail(user.email, user.name)

        const token = await user.generateAuthToken()
        res.status(201).send({user:user.getUserPublicProfile(), token});
    }catch(e){
        res.status(400).send(e);
    }

});

userRouter.post('/user/login', async (req, res)=>{

    try{
        // here we will define our own function called findByCredentials(), this is not a built-in function, then we will handle
        // the call in the user model and return the user if found and the credentials were correct!
        const user = await User.findByCredentials(req.body.email, req.body.password)

        // generate token when the user log in, here we will call our custom method called generateAuthToken from the user model
        const token = await user.generateAuthToken()
        res.send({user:user.getUserPublicProfile(), token})

    }catch(e){
        res.status(400).send(e.message)
    }
})

userRouter.post('/user/logout', auth, async (req, res)=>{
    try{
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token != req.token
        })
        await req.user.save()
        res.send('you logged out')
    }catch(e){
        console.log(e)
        res.status(500).send(e)
    }
})

userRouter.post('/user/logout-all', auth ,async (req, res)=>{
    try{
        req.user.tokens = []
        await req.user.save()
        res.send('you logged out of all sessions')
    }catch(e){
        res.status(500).send()
    }
})

userRouter.get('/users/me', auth ,async (req, res)=>{

    res.send({user:req.user.getUserPublicProfile()})
})

userRouter.patch('/users/me', auth ,async (req, res)=>{

    // if you want to force the user to update certain fields, write the code below
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name','email','password','age'];

    const isUpdateValid = updates.every((update)=>{
        return allowedUpdates.includes(update);
    });
    
    if(!isUpdateValid){
        return res.status(400).send('Invalid update');
    }
    
    try{
        updates.forEach((update)=>{
            req.user[update] = req.body[update] // updates are the keys: name, email, password,age
        })
        await req.user.save()

        res.send(req.user);
    }catch(e){
        res.status(400).send();
    }

});

userRouter.delete('/users/me', auth, async (req, res)=>{

    // we will use cascade delete, once we delete a user, all their tasks will be deleted
    try{
        await req.user.remove()
        // send mail to the user when they delete their account.
        sendCancelationMail(req.user.email, req.user.name)
        res.send(req.user)
    }catch(e){
        res.status(500).send(e);
    }
})

const upload = multer({
    limits:{
        fileSize: 1000000
    },
    fileFilter(req, file, callback){
        if(!file.originalname.endsWith('.jpg') && !file.originalname.endsWith('.png') && !file.originalname.endsWith('.jpeg')){
            return callback(new Error('Please upload an image'), undefined)
        }

        callback(undefined, true)
    }
})

userRouter.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res)=>{
    // first we will use the sharp npm package to resize and format the avatar uploaded
    // we will resize to 500 x 500 and convert all uploaded images to png
    const buffer = await sharp(req.file.buffer).resize({width:500, height:500}).png().toBuffer()

    req.user.avatar = buffer
    await req.user.save()

    res.send()
},(error, req, res, next)=>{
    res.status(400).send({error: error.message})
})

userRouter.delete('/users/me/avatar', auth, async(req, res)=>{
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

userRouter.get('/users/:id/avatar', async (req, res)=>{

    try{
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    }catch(e){
        res.send()
    }
})


module.exports = userRouter;