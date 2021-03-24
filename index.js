const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();
const session = require('express-session');
const flash = require('connect-flash');

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
    'secret': 'whatever',
    'resave': false, // we will not resave the session if there are no changes
    'saveUninitialized': true // if a client conencts with no session, immediately create one
}));

// setup Flash
app.use(flash());

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

// import in the routes
const landingRoutes = require('./routes/landing');
const corporateRoutes = require('./routes/corporate');
const productRoutes = require('./routes/products')
const userRoutes = require('./routes/users')

async function main() {
  // if the URL begins exactly with a forward slash
  // use the landingRoutes
  app.use('/', landingRoutes);
  app.use('/for-investors', corporateRoutes);
  app.use('/products', productRoutes);
  app.use('/users', userRoutes);
}

main();

app.listen(3000, () => {
  console.log("Server has started");
});