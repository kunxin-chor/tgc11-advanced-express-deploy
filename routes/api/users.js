const express = require('express')
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto')

const {User} = require('../../models')

const {checkIfAuthenticatedJWT} = require('../../middlewares')

const generateAccessToken = (user) => {
    return jwt.sign(user, process.env.TOKEN_SECRET,{
        'expiresIn':'1h'  // expires in 1 hour time
    })
}

const getHashedPassword = (password) => {
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;
}

router.post('/login', async(req,res)=>{
    // assuming that the user is logging in with email and password
    let user = await User.where({
        'email': req.body.email
    }).fetch({
        require:false
    });
    
    if (user && user.get('password') == getHashedPassword(req.body.password)) {
        let accessToken = generateAccessToken({
            'username': user.get('username'),
            'email': user.get('email'),
            'id': user.get('id')
        })
        res.send({
            accessToken
        });
    } else {
        res.status(401);
        res.send({
            'error':'Invalid email or password'
        })
    }
})

router.get('/profile', checkIfAuthenticatedJWT, (req,res)=>{
    let user = req.user;
    res.send(user);
});

module.exports = router;