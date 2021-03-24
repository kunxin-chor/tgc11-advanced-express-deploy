const express = require('express')
const router = express.Router()
const crypto = require('crypto')

const { createUserForm, createLoginForm, bootstrapField } = require('../forms')

const { User } = require('../models');

const getHashedPassword = (password) =>{
    const sha256 = crypto.createHash('sha256');
    const hash = sha256.update(password).digest('base64');
    return hash;

}

router.get('/register', (req, res) => {
    const registrationForm = createUserForm();
    res.render('users/register', {
        form: registrationForm.toHTML(bootstrapField)
    })
})

router.post('/register', (req, res) => {
    const registrationForm = createUserForm();
    registrationForm.handle(req, {
        'success': async (form) => {

            // the following won't work
            // the users table does not have a confirm_password column
            // but it exists inside form.data, so we cannot use
            // form.data directly
            // const user = new User(form.data)

            let { confirm_password, ...userData } = form.data;
            userData.password = getHashedPassword(userData.password);
            const user = new User(userData);
            await user.save();
            req.flash('success_messages', "You have been registered!")
            res.redirect('/users/login')

            // const user = new User({
            //     'username': form.data.username,
            //     'password': form.data.password,
            //     'email': form.data.email
            // })
        },
        'error': (form) => {
            res.render('users/register', {
                'form': form.toHTML(bootstrapField)
            })
        }

    })
})

router.get('/login', (req, res) => {
    const loginForm = createLoginForm();
    res.render('users/login', {
        'form': loginForm.toHTML(bootstrapField)
    });
})

router.post('/login', async (req, res) => {
    const loginForm = createLoginForm();
    loginForm.handle(req, {
        'success': async (form) => {

            // 1. find the user based on the email address
            let user = await User.where({
                'email': form.data.email
            }).fetch();

            // 2. if the user exists, check if the password
            // matches
            if (user) {
                // 3a. if the password matches, then authenticate the user
                // i.e, save the user data to the session
                if (user.get('password') == getHashedPassword(form.data.password)) {
                    // save the user data to the session
                    req.session.user = {
                        id: user.get('id'),
                        username: user.get('username'),
                        email: user.get('email')
                    }
                    req.flash('success_messages', `Welcome back, ${req.session.user.username}`);
                    res.redirect('/products');

                }
            } else {

                // 3b. but if the password don't matches,
                // redirect to the login page with an error message
                req.flash('error_messages', 'Please double check your email and password');
                res.redirect('/users/login');
            }
        },
        'error': (form) => {
            res.render('users/login', {
                'form': form.toHTML(bootstrapField)
            });
        }
    })
})

router.get('/profile', (req,res)=>{
    if (!req.session.user) {
        // current user has not logged in
        req.flash('error_messages', 'Please login first');
        res.redirect('/users/login')
    } else {
        res.render('users/profile',{
            'user': req.session.user
        })
    }
})

router.get('/logout', (req,res)=>{
    req.session.user = null;
    req.flash('success_messages', 'Bye bye');
    res.redirect('/users/login')
})

module.exports = router;