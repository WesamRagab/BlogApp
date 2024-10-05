const fa = require('fs');
const path = require('path');
const asyncHandler = require('express-async-handler');
const {Post , validateCreatePost} = require('../models/Post');
const { cloudinaryUploadImage, cloudinaryRemoveImage } = require('../utils/cloudinary') ;
const {Comment} =  require('../models/Comment');

// Ctrate a new post
module.exports.createPostCtrl = asyncHandler(async(req , res) =>{
    //1 validation for img
    if(!req.file){
        return res.status(404).json({message: "No Image Provided"}); 
    }
    //2 validation for data
    const {error} = validateCreatePost(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message});
    }
    //3 upload \photo
     const imagePath = path.join( __dirname, `../images/${req.file.filename}`);
     const result = await cloudinaryUploadImage(imagePath);

   // second way to create post
    const post = await Post.create({
        title: req.body.title,
        description: req.body.description,
        category:  req.body.category,
        user: req.user.id,
        image: {
           url: result.secure_url,
           publicId : result.publicId
        },
        
    });
    //5 send the response to the client
    res.status(201).json(post);

    //6 delete the uploaded image
    fa.unlinkSync(imagePath); 
 });

 //Get all posts
 module.exports.getAllPostsCtrl = asyncHandler(async(req , res) =>{ r
    const POST_PER_PAGE = 3;
    const {pageNumber , category}= req.query;
    let posts;
    if(pageNumber){
        posts = await Post.find()
       .skip((pageNumber - 1) * POST_PER_PAGE)
       .limit(POST_PER_PAGE)
       .populate("user" , ["-password"]);
    }else if (category) {
        posts = await Post.find({category})
        .populate("user" , ["-password"])

    }else {
        posts = await Post.find()
        .sort({ createdAt: -1})
        .populate("user" , ["-password"])
    }
    res.status(200).json(posts);
 });

 //Get single post
 module.exports.getSinglePostCtrl = asyncHandler(async(req , res) =>{
    const post = await Post.findById(req.params.id)
          .populate("user" , ["-password"])
          .populate("comments");
    if(!post){
        return res.status(404).json({message: "Post not found"});
    }
    res.status(200).json(post); 
 });

 //get posts count
 module.exports.getPostCountCtrl = asyncHandler(async(req , res) =>{
    const count = await Post.countDocuments();
    res.status(200).json(count);
 });

// Delete single post

module.exports.deletePostCtrl = asyncHandler(async(req , res) =>{
    const post = await Post.findById(req.params.id)
          
    if(!post){
        return res.status(404).json({message: "Post not found"});
    }
    if(req.user.isAdmin || req.user.id === post.user.toString() ){
        await Post.findByIdAndDelete(req.params.id);
        await cloudinaryRemoveImage(post.image.publicId);

    // dalete all comments that belong to this post
    await Comment.deleteManyComments({postId : post._id});
    
    res.status(200).json({message: "Post has been deleted successfully" ,
        postId: post._id
    }); 

}else {
    return res.status(403).json({message: "Not allowed, only admin or owner of the post can delete it"});
}
 });
 
 // Update post
module.exports.UpdatePostCtrl = asyncHandler(async(req , res) =>{
    //1 validtion
    const {error} = validateCreatePost(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message});
    }
    //2 find the post
    const post = await Post.findById(req.params.id);
    if(!post){
        return res.status(404).json({message: "Post not found"});
    }
    //3 check if the user is the owner or admin
    if( req.user.id !== post.user.toString() ) {
        return res.status(403).json({message: "access denied , you are not allowed"});
    }
    //4 update the post
    const updatedPost = await Post.findByIdAndUpdate(req.params.id , {
        $set:{
            title: req.body.title,
            description: req.body.description,
            category: req.body.category 
        }
    } , {new: true }).populate("user" , ["-password"])
    //5 send the response 
    res.status(200).json(updatedPost);
    
});

//
module.exports.UpdatePostImageCtrl = asyncHandler(async(req , res) =>{
    //1 validation for img
    if(!req.file){
        return res.status(400).json({message:"No image Provided"});
    }
    //2 find the post
    const post = await Post.findById(req.params.id);
    if(!post){
        return res.status(404).json({message: "Post not found"});
    }
    //3 check if the user is the owner or admin
    if( req.user.id !== post.user.toString() ) {
        return res.status(403).json({message: "access denied , you are not allowed"});
    }
    //4 update the post image
    
    //delete the old img
    await cloudinaryRemoveImage(post.image.publicId);
    // upload the new img
    const imagePath = path.join( __dirname, `../images/${req.file.filename}`);
    const result = await cloudinaryUploadImage(imagePath);
    // update the post image in db
      //4 update the post
    const updatedPost = await Post.findByIdAndUpdate(req.params.id , {
        $set:{
          image : {
            url: result.secure_url,
            publicId : result.public_id
          }
        }
    } , {new: true }
 );

    
    //5 send the response 
    res.status(200).json(updatedPost);
    //8 remove img from the server
    fa.unlinkSync(imagePath);

});

// Toggle like controller
module.exports.toggleLikeCtrl = asyncHandler(async(req , res) =>{

    const loggedInUser = req.user.id;
    const {id: postId} = req.params;

    let post = await Post.findById(postId);
    if(!post){
        return res.status(404).json({message: "Post not found"});
    }
    const isPostAlreadyLiked = post.likes.find((user)=> user.toString () === loggedInUser)
    if(isPostAlreadyLiked){
        post = await Post.findByIdAndUpdate(postId , {
            $pull: {likes : loggedInUser}
        }, {new : true});
     }else{
        post = await Post.findByIdAndUpdate(postId, {
            $push: {likes : loggedInUser}
        }, {new : true});
     }
     res.status(200).json(post);
});



