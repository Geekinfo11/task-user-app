const mongoose = require('mongoose')
const validator = require('validator')

const taskSchema = new mongoose.Schema({
    description:{
        type:String,
        required:true,
        trim:true
    }, 
    completed:{
        type:Boolean,
        default:false
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'User'
    }
},{
    timestamps:true
})

taskSchema.pre('save', async function(next){
    const task = this
    // do something here before saving the user to the database
    next()// this will call another middleware if it exists
})

const Task = mongoose.model('Task', taskSchema)


module.exports = Task
