const router = require('express').Router();
const { createPostCtrl, getAllPostsCtrl, getSinglePostCtrl, getPostCountCtrl, deletePostCtrl, UpdatePostCtrl, UpdatePostImageCtrl, toggleLikeCtrl } = require('../controllers/postsController');
const PhotoUpload = require('../middlewares/photoUpload');
const {verifyToken }= require('../middlewares/verifyToken');
const validateObject = require('../middlewares/validateObjectId');

// console.log(validateObject);
// /api/posts
router.route('/')
       .post(verifyToken, PhotoUpload.single("image") , createPostCtrl)
       .get(getAllPostsCtrl );

// /api/posts/:id
router.route('/count').get(getPostCountCtrl);

router.route('/:id')
      .get(validateObject, getSinglePostCtrl)
      .delete(validateObject , verifyToken ,deletePostCtrl)
      .put(validateObject , verifyToken ,UpdatePostCtrl);
 


router.route('/update-img/:id')
       .put(validateObject,verifyToken, PhotoUpload.single("image"), UpdatePostImageCtrl);

router.route('/like/:id')
       .put(validateObject,verifyToken, toggleLikeCtrl);




module.exports = router;
