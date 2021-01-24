const express = require('express');
const app = express();
const Task = require('../db/models/task');
const auth = require('../middleware/auth')

const taskRouter = new express.Router();

taskRouter.post('/tasks', auth ,async (req, res)=>{

    try{
        const task = new Task({
            ...req.body,
            user:req.user._id
        })
        await task.save();
        res.status(201).send(task);
    }catch(e){
        res.status(400).send();
    }
});

// filtering: GET: /tasks?completed=true       <= return only the tasks that are completed=true
// pagination: GET: /tasks?limit=2&skip=1      <= this means to skip the first and fetch the second and third tasks
// sorting: GET: /tasks?sortBy=createdAt:desc  <= this means to sort by the crearedAt field in the desceding order
taskRouter.get('/tasks', auth, async (req, res)=>{

    try{
        const filter = {}
        const sort = {}

        if(req.query.completed){
            filter.completed = req.query.completed === 'true'
        }

        if(req.query.sortBy){
            const parts = req.query.sortBy.split(':')
            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1 
        }
        
        await req.user.populate({
            path:'tasks',
            match:filter,
            options:{
                limit:parseInt(req.query.limit),
                skip:parseInt(req.query.skip),
                sort:sort
            }
        }).execPopulate()

        // to access the user tasks.
        res.status(200).send(req.user.tasks);
    }catch(e){
        res.status(500).send();
    }
});

taskRouter.get('/tasks/:id', auth, async (req, res)=>{
    const id = req.params.id;
    
    try{
        const task = await Task.findOne({_id:id, user:req.user._id});
        if(!task){
            return res.status(404).send();
        }
        res.status(200).send(task);
    }catch(e){
        res.status(500).send();
    }

});

taskRouter.patch('/tasks/:id', auth, async (req, res)=>{
    const id = req.params.id;

    // if you want to force the user to update certain fields, write the code below
    const updates = Object.keys(req.body);
    const allowedUpdates = ['description','completed'];

    const isUpdateValid = updates.every((update)=>{
        return allowedUpdates.includes(update);
    })

    if(!isUpdateValid){
        return res.status(400).send();
    }

    try{
        const task = await Task.findOne({_id:id, user:req.user._id});
        if(!task){
            return res.status(404).send();
        }

        updates.forEach((update)=>{
            task[update] = req.body[update]
        })
        await task.save()
        res.send(task);
    }catch(e){
        res.status(400).send();
    }
})

taskRouter.delete('/tasks/:id', auth, async(req, res)=>{
    const id = req.params.id;

    try{    
        const task = await Task.findOneAndDelete({_id:id, user:req.user._id});
        if(!task){
            return res.status(404).send();
        }

        res.send(task);
    }catch(e){
        res.status(500).send();
    }
})

module.exports = taskRouter;