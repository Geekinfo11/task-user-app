const express = require('express');

const app = express();

const path = require('path')

// this if statement will be executed only when we're running our app localy, not on production
if(process.argv[2] == 'dev'){// go to package.json for more info
    // here we configure dotenv to load the env variables in the config/dev.env
    require('dotenv').config({path:path.join(__dirname+'../../config/dev.env')})// dev.env variables are for local development
}

const port = process.env.PORT

// this will execute the mongoose.js to connect to the database
require('./db/mongoose');

// this line will convert Json data coming from users to Javascript object
app.use(express.json());

// setup the home route
app.get('/', (req, res)=>{
    res.send('<h1>Welcome to the Home page</h1><p>Please make sure to use an API client to use our app</p>')
})

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


