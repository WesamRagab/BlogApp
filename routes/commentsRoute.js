const router = require('express').Router();
const { createCommentCtrl, getAllCommentsCtrl, deleteCommentCtrl, updateCommentCtrl } = require('../controllers/commentsController');
const {verifyToken} = require('../middlewares/verifyToken');
 const validateObject = require('../middlewares/validateObjectId');

// api/comments
router.route("/")
      .post(verifyToken, createCommentCtrl)
      .get(verifyToken , getAllCommentsCtrl);

//api/comments/:id
router.route('/:id')
      .delete(validateObject, verifyToken , deleteCommentCtrl)
      .put(validateObject , verifyToken ,updateCommentCtrl );

module.exports = router;  