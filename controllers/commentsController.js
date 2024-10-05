const asyncHAndler = require('express-async-handler');
const {Comment , validateCreateComment , validateUpdateComment} = require('../models/Comment');
const {User} =  require('../models/User');


/**------------------------------------------
 @desc Create a new comment for a post
 @route POST /api/comments
 @access Private only logged in users
 --------------------------------------------*/
 module.exports.createCommentCtrl = asyncHAndler(async(req, res) => {
    // Validation
    const { error } = validateCreateComment(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const profile = await User.findById(req.user.id);

    const comment = await Comment.create({
        postId: req.body.postId,
        text: req.body.text,
        user: req.user.id,
        username: profile.username,
    });
    res.status(201).json(comment);
    
});

//get all comments only admins
module.exports.getAllCommentsCtrl = asyncHAndler(async(req , res)=>{
    const comments = await Comment.find()
         .populate('user', ['-password']);

    res.status(200).json(comments);

});

//update comments only admins

module.exports.updateCommentCtrl = asyncHAndler(async(req,res)=>{
    // Validation
    
    const { error } = validateUpdateComment(req.body);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const comment = await Comment.findById(req.params.id);

    if(!comment){
        return res.status(404).json({message: "Comment not found"});
    }


    if( req.user.id !== comment.user.toString()){
       
        return res.status(403).json({message: "Unauthorized to update this comment , only user him self"});

    }
    const updatedComment = await Comment.findByIdAndUpdate(req.params.id ,{
            $set :{
                text: req.body.text
            }
         },
            {new: true}
        );

    res.status(200).json(updatedComment);
    
});



//delete comments only admins

module.exports.deleteCommentCtrl = asyncHAndler(async(req,res)=>{
    const comment = await Comment.findById(req.params.id)

    if(!comment){
        return res.status(404).json({message: "Comment not found"});
    }
    //
    if(req.user.isAdmin || req.user.id === comment.user.toString()){
        await Comment.findByIdAndDelete(req.params.id);
        res.status(200).json({message: "Comment deleted successfully"});

    }else{
        return res.status(403).json({message: "Unauthorized to delete this comment"});
    }

});

