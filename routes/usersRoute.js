const { getAllUsersCtrl, getUserProfileCtrl, UpdateUserProfileCtrl, getUsersCountCtrl, profilePhotoUploadCtrl, deleteUserProfileCtrl } = require('../controllers/usersControllers');
const { verifyTokenAndAdmin, verifyTokenAndOnlyUser, verifyToken ,verifyTokenAndAuthorization } = require('../middlewares/verifyToken');
const validateObject = require('../middlewares/validateObjectId');
const photoUpload = require('../middlewares/photoUpload');
const router =  require('express').Router();


router.route("/profile").get( verifyTokenAndAdmin, getAllUsersCtrl);


router.route("/profile/:id")
.get(validateObject, getUserProfileCtrl)
.put(validateObject, verifyTokenAndOnlyUser,UpdateUserProfileCtrl)
.delete(validateObject , verifyTokenAndAuthorization ,deleteUserProfileCtrl)    


router.route("/count").get(getUsersCountCtrl);

router.route("/profile/profile-photo-upload")
      .post(verifyToken, photoUpload.single("image"),profilePhotoUploadCtrl) ;
     


module.exports = router ;