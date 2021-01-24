const { send } = require('@sendgrid/mail')
const nodemailer = require('nodemailer')
const { google } = require('googleapis')

const oAuth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.CLIENT_SECRET, process.env.REDIRECT_URI)

oAuth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN })


const setupMail = async ()=>{
    try{
       const accessToken = await oAuth2Client.getAccessToken()
       const transporter = nodemailer.createTransport({
        service:'gmail',
        // auth:{
        //     user: process.env.EMAIL, 
        //     pass: process.env.PASSWORD
        // }
    
        // this auth object is for production server, auth credentials user and pass won't work
        auth:{
            type: 'OAuth2',
            user: process.env.EMAIL,
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            refreshToken: process.env.REFRESH_TOKEN,
            accessToken: accessToken,
        }
    })
    return transporter

    }catch(e){
        return e
    }
}

// send mail to the user when they sign up, this function is called from the routes/user.js script
const sendWelcomeMail = (email, name)=>{
    setupMail().then((transporter)=>{
        transporter.sendMail({
            from: process.env.EMAIL, // sender address
            to: email, // list of receivers
            subject: 'Thanks for signing up!', // Subject line
            text: `Welcome to the app, ${name}, we're glad to have you here` // plain text body
        })
    })
} 

const sendCancelationMail = (email, name)=>{
    setupMail().then((transporter)=>{
        transporter.sendMail({
            from: process.env.EMAIL, // sender address
            to: email, // list of receivers
            subject: 'Is this GoodBye!', // Subject line
            text: `We're sorry to see you go ${name}, are you sure you don't want to reconsider?` // plain text body
        })
    })
}

module.exports = { sendWelcomeMail, sendCancelationMail}