const router = require('express').Router();
const { createCategoryCtrl, getCategoriesCtrl, deleteCategoriesCtrl   } = require('../controllers/categoriesController');
const { verifyTokenAndAdmin } = require('../middlewares/verifyToken');
const validateObjectId = require('../middlewares/validateObjectId');

 router.route('/')
       .post( verifyTokenAndAdmin ,createCategoryCtrl )
       .get( getCategoriesCtrl );



 router.route('/:id')
       .delete( validateObjectId ,verifyTokenAndAdmin ,deleteCategoriesCtrl )

module.exports = router;