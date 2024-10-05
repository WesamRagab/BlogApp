const asyncHAndler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const {User , validateRegisteredUser , validateLoginUser} = require('../models/User');

/*-----------------------
 @desc Register new user
 @route /api/auth/register
 @method POST
 @access Public

-------------------------*/
module.exports.registerUserCtrl = asyncHAndler(async(req , res)=>{ 
     //validation
     const {error} = validateRegisteredUser(req.body);
      if(error){
        //the user Entered the wrong data (bad request 400)
         return res.status(400)
                   .json({msg: error.details[0].message});
      }
     //is the user already registered(exist) checking it in the database
     let user = await User.findOne({email: req.body.email});
     if(user){
        return res.status(400).json({message: " This User Already Registered"})
     }
     
     //hash the user password  
     const salt = await bcrypt.genSalt(10);
     const hashPassword = await bcrypt.hash(req.body.password , salt);
     // then add new user and save it to the database
     user =  new User({
        username : req.body.username,
        email : req.body.email,
        password : hashPassword
     });
     await user.save();

     //send the response to the user
     res.status(201).json({message: "Registered done Successfully , please Log In" })


});


/*-----------------------
 @desc  LogIN user
 @route /api/auth/login
 @method POST
 @access Public

-------------------------*/

 module.exports.loginUserCtrl = asyncHAndler(async(req, res)=>{
   // validation
   const {error} = validateLoginUser(req.body);
   if(error){
      return res.status(400).json({message: error.details[0].message});
   }
   
   // is the user exists
   const user = await User.findOne({email : req.body.email});
   if(!user){
      res.status(400).json({ message :"Invalid Email or Password"});
   }
   //check the password
   const isPassword = await bcrypt.compare(req.body.password , user.password );
   
   if(!isPassword){
      res.status(400).json({ message :"Invalid Password"});
   }
   // generate token 
   const token = user.generateAuthToken();

   res.status(200).json({
      _id: user._id,
      isAdmin: user.isAdmin,
      profilePhoto : user.profilePhoto,
      token,

   });
   //response to client

 });