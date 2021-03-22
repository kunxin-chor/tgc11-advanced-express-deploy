const express = require('express')
const router = express.Router();

router.get('/founders', (req,res)=>{
    res.send('About our founders')
})

router.get('/funding', (req,res)=>{
    res.send('funding')
})

// export out the entire router object
module.exports = router;