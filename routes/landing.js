const express = require('express');

// #1 create a new express Router
const router = express.Router();

router.get('/', (req,res)=>{
    res.send('welcome')
})

router.get('/about', (req,res)=>{
    res.send("about")
})

router.get('/contact-us', (req,res)=>{
    res.send("contact-us");
})

module.exports = router;