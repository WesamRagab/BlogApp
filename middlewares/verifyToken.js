const jwt = require('jsonwebtoken');


//verify that the token is valid for the current user 
function verifyToken(req, res, next) {
    const authToken = req.headers.authorization;
    if(authToken){
        const token = authToken.split(' ')[1];
        try { 
            const decodedPayload = jwt.verify(token , process.env.JWT_SECRET);
            req.user = decodedPayload;
            next(); // pass the request to the next handler

        }catch(error){
            return res.status(401).json({message: 'Invalid Token , access_denied'});

        };

    }else {
        return res.status(401).json({message: ' no token provided , access_denied'});
    }

}

//only admin can access
function verifyTokenAndAdmin(req, res, next) {
    verifyToken(req,res,()=> {
        if(req.user.isAdmin){
            next();
        }else{
            return res.status(403).json({message: 'not allowed , only admin'});

        }
    })
}

//only user can access
function verifyTokenAndOnlyUser(req, res, next) {
    verifyToken(req,res,()=> {
        if(req.user.id === req.params.id){
            next();
        }else{
            return res.status(403).json({message: 'not allowed , only user can access '});

        }
    })
}
 //verify Token And Authorization (user and admin   )
function verifyTokenAndAuthorization(req, res, next) {
    verifyToken(req,res,()=> {
        if(req.user.id === req.params.id ||req.user.isAdmin){
            next();
        }else{
            return res.status(403).json({message: 'not allowed , only the user himself or the admin'});

        }
    })
}


module.exports = {
    verifyToken,
    verifyTokenAndAdmin,
    verifyTokenAndOnlyUser,
    verifyTokenAndAuthorization
};