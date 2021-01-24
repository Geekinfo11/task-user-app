const jwt = require('jsonwebtoken')
const User = require('../db/models/user')

const auth = async (req, res, next)=>{

    try{
        const token = req.header('Authorization').replace('Bearer ', '')
        const verifiedToken = jwt.verify(token, process.env.TOKEN_SECRET_PHRASE)// this line will throw an error if the token was invalid. and execute
        // the catch(e)
        const user = await User.findOne({_id:verifiedToken._id, 'tokens.token':token})

        if(!user){
            return res.status(401).send('Please Authenticate')
        }
        // we will save the user to the request to work with it in the route
        req.user = user
        req.token = token
        next()
    }catch(e){
        res.status(401).send('Please Authenticate.')
    }
    
}


module.exports = auth