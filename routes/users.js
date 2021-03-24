const express = require('express')
const router = express.Router()

const {createUserForm, bootstrapField} = require('../forms')

const {User} = require('../models');

router.get('/register', (req,res)=>{
    const registrationForm = createUserForm();
    res.render('users/register', {
        form: registrationForm.toHTML(bootstrapField)
    })
})

router.post('/register', (req,res)=>{
    const registrationForm = createUserForm();
    registrationForm.handle(req, {
        'success':async(form)=>{

            // the following won't work
            // the users table does not have a confirm_password column
            // but it exists inside form.data, so we cannot use
            // form.data directly
            // const user = new User(form.data)

            let {confirm_password, ...userData} = form.data;
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
        'error':(form)=>{
            res.render('users/register',{
                'form': form.toHTML(bootstrapField)
            })
        }

    })
})

router.get('/login', (req,res)=>{
    return res.render('users/login');
})

module.exports = router;