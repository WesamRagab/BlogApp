const asyncHAndler = require('express-async-handler');
const {User, validateUpdateUser } = require('../models/User');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const { 
  cloudinaryUploadImage,
  cloudinaryRemoveImage ,
  cloudinaryRemoveMultipleImages
 } = require('../utils/cloudinary.js');
 const {Comment} = require('../models/Comment');
 const {Post} = require('../models/Post');


/*-----------------------
* @desc Get All users Profile
* @route /api/users/profile
  @method Get
 @access Private (only admin)

-------------------------*/
module.exports.getAllUsersCtrl = asyncHAndler(async(req,res)=>{
    const users = await User.find().select("-password");  
    res.status(200).json(users);

}); 


/**-----------------------
 @desc  Get user Profile
 @route  /api/users/profile/:id
 @method GET
 @access Public

-------------------------*/
module.exports.getUserProfileCtrl = asyncHAndler(async(req,res)=>{
  const user = await User.findById(req.params.id).select("-password").populate('posts');
  if (!user) {
    res.status(404).json({message: "User not found"});
  }
  res.status(200).json(user);
  
}); 

/**------------------------------------------
 * @desc Update user Profile
 * @route  /api/users/profile/:id
 * @method PUT
 * @access Private (only user himself)

--------------------------------------------*/
   
module.exports.UpdateUserProfileCtrl = asyncHAndler(async(req,res)=>{
  //1 validation
  
  const {error} = validateUpdateUser(req.body);
  if(error) {

    return res.status(404).json({ message: error.details[0].message });

  }
  //2 check if the user want to edit the password
  if(req.body.password){
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);

  }
  //3 update the user
  const updateUser = await User.findByIdAndUpdate(req.params.id , {
     $set: {
       username: req.body.username,
       password: req.body.password,
       bio: req.body.bio
     }
  },{new:true}).select("-password");
  //4 return the updated user
   res.status(200).json(updateUser)

}); 

/**-----------------------

   @desc Get user count
   @route /api/users/count
   @method Get
   @access Private (only admin)

-------------------------*/
module.exports.getUsersCountCtrl = asyncHAndler(async(req,res)=>{
  const count = await User.countDocuments();
  res.status(200).json(count);

}); 

/*-----------------------
* @desc Profile Photo Upload
* @route /api/users/profile/profile-photo-upload
  @method Post
 @access Private (only logged in users)


-------------------------*/

module.exports.profilePhotoUploadCtrl = asyncHAndler(async(req,res)=>{
  // 1 validation 
  if(!req.file){
    return res.status(400).json({message: "No image uploaded"}); 

  }
  // 2 Get the path to the image
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);

  // 3 upload to  cloudinary
  const result = await cloudinaryUploadImage(imagePath);
  console.log(result);

  // 4 Get the user from DB
  const user = await User.findById(req.user.id)
  
  // 5 Delete the old profile photo if exist 
  if(user.profilePhoto.publicId !== null ){
    await cloudinaryRemoveImage(user.profilePhoto.publicId);
  }


  // 6 change the profilePhoto field in the DB
  user.profilePhoto = {
    url: result.secure_url,
    publicId: result.public_id
  }
  await user.save();

  // 7 send response to client 
  res.status(200).json({
    message: "your profile photo uploaded successfully ",
    profilePhoto: { url:result.secure_url , publicId: result.public_id }
  });

 // 8 Remove image from the server
  fs.unlinkSync(imagePath);

}); 

/**------------------------------------------
 * @desc Delete user Profile
 * @route  /api/users/profile/:id
 * @method DELETE
 * @access Private (only admins or user)

--------------------------------------------*/
module.exports.deleteUserProfileCtrl = asyncHAndler(async(req,res)=>{
  
  // 1 get the user from db
  const user = await User.findById(req.params.id);
  if(!user){
    return res.status(404).json({message: "User not found"});
  }


  //2 get all posts from db
  const posts = await User.find({user : user._id});

  //3 get publicIds from the posts
  const PublicIds = posts?.map((post) => post.image.publicId);

  //4 delete all posts from cloudinary that belong to this user
  if(PublicIds?.length > 0){
    await cloudinaryRemoveMultipleImages(PublicIds);
  }

  //5 delete the profile picture from cloudinary
   await cloudinaryRemoveImage(user.profilePhoto.publicId);


 // @TODO 6 delete user posts and comments
 await Post.deleteMany({user : user._id});
 await Comment.deleteMany({user : user._id});

  //7 delete the user himself
  await User.findByIdAndDelete(req.params.id); 

  //8 send a response to the client 
  res.status(200).json({message : "User profile has been deleted successfully"});

});
