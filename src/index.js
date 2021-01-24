const express = require('express');

const app = express();

const path = require('path')

// this if statement will be executed only when we're running our app localy, not on production
if(process.argv[2] == 'dev'){// go to package.json for more info
    // here we configure dotenv to load the env variables in the config/dev.env
    require('dotenv').config({path:path.join(__dirname+'../../config/dev.env')})// dev.env variables are for local development
}

const port = process.env.PORT

// // create a middleware, this middleware runs before we run the route handler, this middleware is just a function.
// // Without middleware: new request -> run route handler
// // with middleware: new request -> do something -> run route handler
// app.use((req, res, next)=>{
//     res.status(503).send('Site is currently down. check back soon!')
    
//     // next()  tells the express server that our function is done, run the route handler now, but if we dont specify next()
//     // the incoming request from the user will be hanging.
// })


// this will execute the mongoose.js to connect to the database
require('./db/mongoose');

// this line will convert Json data coming from users to Javascript object
app.use(express.json());

// this router has all user routes
const userRouter = require('./routers/user');
app.use(userRouter);

// this router has all task routes
const taskRouter = require('./routers/task');
app.use(taskRouter);


// this line will start the express server up
app.listen(port, ()=>{
    console.log('server is up on port '+port);
});


