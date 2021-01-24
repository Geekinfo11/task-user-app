const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    email:{
        type:String,
        required:true,
        trim:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('email is invalid')
            }
        }
    },
    password:{
        type:String,
        required:true,
        trim:true,
        minLength:6,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('password should not contain "password"')
            }
        }
    },
    age:{
        type:Number,
        validate(value){
            if(value < 0){
                throw new Error('age must be positive')
            }
        }
    },
    tokens:[{
            token:{
                type:String,
                required:true
            }
        }
    ],
    avatar:{
        type:Buffer
    }
},{
    timestamps:true
})

// create a virtual field for the User model to access their tasks. now we can use the populate('tasks') method to access the task
// object not only its _id
userSchema.virtual('tasks',{
    ref:'Task', // reference to the Task model
    localField:'_id', // the field _id in the User model
    foreignField:'user' // the field user in the Task model
})

userSchema.methods.getUserPublicProfile = function (){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

// methods are accessible on the instance of a model, not the model itself
userSchema.methods.generateAuthToken = async function(){ // we didnt use arrow function because arrow functions dont bind 'this' 
    const user = this // this is the instance that called the generateAuthToken method. which is the user instance
    const token = jwt.sign({_id:user._id.toString()}, process.env.TOKEN_SECRET_PHRASE, {expiresIn:'7 days'})// create a token for user
    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

// statics are accessible on the model, sometimes called model methods
userSchema.statics.findByCredentials = async (email, password)=>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('Unable to log in')
    }

    // here we compare the password provided by the user will hashed password registered in the database
    const isValid = await bcrypt.compare(password, user.password)

    if(!isValid){
        throw new Error('Unable to log in')
    }

    return user
}

// hash the plain text password before saving it to the database
userSchema.pre('save', async function(next){
    const user = this // this is the current user we want to save to the database
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }
    next()
})

// before deleting the user, we will delete their tasks first
userSchema.pre('remove', async function(next){
    const user = this
    await Task.deleteMany({user:user._id})
    next()
})

// creating a User model
const User = mongoose.model('User',userSchema)

module.exports = User