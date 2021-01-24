const { send } = require('@sendgrid/mail')
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user: process.env.EMAIL, // i could have put email here in plain text, but for security reasons i installed the dotenv npm package
        // and created .env file to put email and password there, now there are global variables 
        pass: process.env.PASSWORD
    }
})


// send mail to the user when they sign up, this function is called from the routes/user.js script
const sendWelcomeMail = (email, name)=>{
    transporter.sendMail({
        from: process.env.EMAIL, // sender address
        to: email, // list of receivers
        subject: 'Thanks for signing up!', // Subject line
        text: `Welcome to the app, ${name}, we're glad to have you here` // plain text body
    })
} 

const sendCancelationMail = (email, name)=>{
    transporter.sendMail({
        from: process.env.EMAIL, // sender address
        to: email, // list of receivers
        subject: 'Is this GoodBye!', // Subject line
        text: `We're sorry to see you go ${name}, are you sure you don't want to reconsider?` // plain text body
    })
}

module.exports = { sendWelcomeMail, sendCancelationMail}