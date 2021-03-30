const jwt = require('jsonwebtoken')

const checkIfAuthenticated=(req,res,next)=>{
    if (req.session.user) {
        // if the middleware executes successfully,
        // call next()
        next();
    } else {
        req.flash('error_messages', 'Please login before accessing that page');
        res.redirect('/users/login');
        // so if there's an error or a failure
        // don't call next()
    }
}

const checkIfAuthenticatedJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.TOKEN_SECRET, (err,user)=>{
            if (err) {
                res.sendStatus(403);
            }

            req.user = user;
            next();
        })
    } else {
        res.status(401);
        res.send({
            'error':'Login required'
        });
    }
}

module.exports = {
    checkIfAuthenticated, checkIfAuthenticatedJWT
}