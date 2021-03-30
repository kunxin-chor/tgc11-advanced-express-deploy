const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const flash = require('connect-flash');
const csurf = require('csurf')


// create an instance of express app
let app = express();

// set the view engine
app.set("view engine", "hbs");

// static folder
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// enable forms
app.use(
  express.urlencoded({
    extended: false
  })
);

// setup session
app.use(session({
    'store': new FileStore(),
    'secret': process.env.SESSION_SECRET_KEY,
    'resave': false, // we will not resave the session if there are no changes
    'saveUninitialized': true // if a client conencts with no session, immediately create one
}));

// Both Flash and CSURF needs session,
// so we only use them after we set up our sessions

// setup Flash
app.use(flash());

// setup CSURF
// app.use(csurf());
const csurfInstance = csurf();
app.use(function (req, res, next) {
  // exclude /checkout/process_payment for CSRF
  if (req.url === '/checkout/process_payment' || 
      req.url.slice(0,5) == '/api/') {
      return next()
  }
  csurfInstance(req, res, next)
})

app.use(function (err, req, res, next) {
     if (err && err.code == "EBADCSRFTOKEN") {
         req.flash('error_messages', 'The form has expired. Please try again');
         res.redirect('back');
     } else {
         console.log("going next");
         next()
     }
});

// a middleware (Flash middleware)
app.use(function(req,res,next){
    // inject into the hbs file the success messages and error messages
    res.locals.success_messages = req.flash('success_messages');
    res.locals.error_messages = req.flash('error_messages');
    next();
})

// global middleware to inject the req.session.user
// object into the local variables (i.e, variables
// accessible by hbs files)
app.use(function(req,res,next){
    res.locals.user = req.session.user;
    next();
})

app.use(function(req,res,next){
    if (req.csrfToken) {
        res.locals.csrfToken = req.csrfToken();
    }
    
    next();
})

// import in the routes
const landingRoutes = require('./routes/landing');
const corporateRoutes = require('./routes/corporate');
const productRoutes = require('./routes/products')
const userRoutes = require('./routes/users')
const cloudinaryRoutes = require('./routes/cloudinary');
const shoppingCartRoutes = require('./routes/shoppingCart');
const checkoutRoutes = require('./routes/checkout')

// API routes
const api = {
    'products': require('./routes/api/products'),
    'users': require('./routes/api/users')
}

async function main() {
  // if the URL begins exactly with a forward slash
  // use the landingRoutes
  app.use('/', landingRoutes);
  app.use('/for-investors', corporateRoutes);
  app.use('/products', productRoutes);
  app.use('/users', userRoutes);
  app.use('/cloudinary', cloudinaryRoutes);
  app.use('/shoppingCart', shoppingCartRoutes);
  app.use('/checkout', checkoutRoutes)
  app.use('/api/products', express.json(), api.products);
  app.use('/api/users', express.json(), api.users)
}

main();

app.listen(3000, () => {
  console.log("Server has started");
});