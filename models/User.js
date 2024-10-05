const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken');


const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength :100,
   
        
    },
    email: {
       type: String,
        required: true,
        trim: true,
        minlength: 5,
        maxlength :100,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
        // unique: true

    },
   profilePhoto: {
    type: Object,
    default: {
        url: 'https://cdn.pixabay.com/photo/2017/02/25/22/04/user-icon-2098873_1280.png' ,
        publicId: null
    }
    },
    bio:{
        type: String,

    },
    
    isAdmin: {
        type: Boolean,
        default: false
    },
    isAccountVerified:{
        type: Boolean,
        default: false
    }
},{
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

//
UserSchema.virtual("posts", {
    ref: 'Post',
    foreignField: 'user',
    localField: '_id',
})

//Generate token
UserSchema.methods.generateAuthToken = function() {
      return jwt.sign({id: this._id , isAdmin: this.isAdmin} , process.env.JWT_SECRET);

}



//User Model
const User = mongoose.model('User', UserSchema);

// Validate Registered User
function validateRegisteredUser (obj){
    const schema = Joi.object({
        username: Joi.string().trim().min(2).max(100).required(),
        email: Joi.string().trim().min(5).max(100).required().email(),
        password: Joi.string().trim().min(8).required(),
    });
    return schema.validate(obj);

}

//logging in  validation
function validateLoginUser (obj){
    const schema = Joi.object({
        email: Joi.string().trim().min(5).max(100).required().email(),
        password: Joi.string().trim().min(8).required(),
    });
    return schema.validate(obj);

}

//  update validation
function validateUpdateUser (obj){
    const schema = Joi.object({
        username: Joi.string().trim().min(2).max(100).required(),
        password: Joi.string().trim().min(8),
        bio: Joi.string()
    });
    return schema.validate(obj);

}


module.exports = {
      User,
      validateRegisteredUser,
      validateLoginUser,
      validateUpdateUser
}