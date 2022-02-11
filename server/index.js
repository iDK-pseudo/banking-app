const express = require("express");
const { body, check, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const path = require("path");
const passport = require('passport');
const LocalStrategy = require('passport-local');
const crypto = require('crypto');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const User = require('./models/user');
const Card = require('./models/card');
const isAuth = require('./routes/authMiddleware').isAuth;
require('dotenv').config();


const PORT = process.env.PORT || 3000;
const app = express();
const MONGODB_URI = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@firstcluster-shard-00-00.kxtke.mongodb.net:27017,firstcluster-shard-00-01.kxtke.mongodb.net:27017,firstcluster-shard-00-02.kxtke.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-9qr6zu-shard-0&authSource=admin&retryWrites=true&w=majority`;

mongoose.connect(MONGODB_URI);

app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: MONGODB_URI }),
  cookie: { 
    secure: false,
    maxAge: 1000 * 60 * 60 * 24
  }
}))

app.use(passport.initialize());

app.use(passport.session());

passport.use(new LocalStrategy(async (email, password, cb) => {
    const foundUser = await User.findOne({email: email});
    if(!foundUser) return cb(null, false, { message: 'Incorrect email or password.' });
    crypto.pbkdf2(password, Buffer.from(foundUser.buf), 310000, 32, 'sha256', (err, hashedPassword) => {
      const bufferedPass = Buffer.from(foundUser.password);
      if (!crypto.timingSafeEqual(bufferedPass, hashedPassword)) {
        return cb(null, false, { message: 'Incorrect email or password.' });
      }else{
        return cb(null, email);
      }
    });
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

app.post('/login',
  function(req, res,next) {
    passport.authenticate('local', (err, user, options)=>{
      if(user){
        req.logIn(user, (err)=>{
        });
        res.send({success:true});
      }else{
        res.send({success:false, ...options});
      }
    })(req,res,next);
  }
);

app.post('/signup',
  check('email','Please enter valid email').isEmail().normalizeEmail().trim().escape(),
  check('password','Password must contain atleast 8 chars, 1 Lowercase, 1 Uppercase, 1 Number, 1 Special Character')
    .isStrongPassword()
    .trim()
    .escape(),
  async (req,res) => {
    const errorsResult = validationResult(req);
    if(errorsResult.isEmpty()){
      const buf =  crypto.randomBytes(32);
      const hashedPassword = crypto.pbkdf2Sync(req.body.password, buf, 310000, 32, 'sha256');
      try {
        const mongoRes = await User.create({
          _id: req.body.email,
          email: req.body.email, 
          password: hashedPassword.toJSON().data,
          buf: buf.toJSON().data
        })
        console.log(`A user was inserted with the _id: ${mongoRes._id}`);
        res.send({success: true});
      }catch (ex){
        if(ex.errmsg.includes('duplicate')){
          res.send({success: false, errors: [{ param: 'duplicate-email', msg: 'User already exists'}]})
        }else{
          res.send({success: false, errors: [{ param: 'server-issue', msg: 'Server issue'}]});
        }
      }
    }else{
      res.send({success: false, ...errorsResult});
    }
  }
)

app.post('/logout', isAuth,
  (req, res)=> {
    req.logout();
    res.send({loggedOut: true});
  })

app.post("/api", isAuth,
  check('cardnum', 'Please enter a valid Card Number').isCreditCard().trim().escape(),
  check('month','Please enter a valid Month').matches(/\d{2}/).isInt({min: 01, max: 12}).trim().escape(),
  check('year','Please enter a valid Year').matches(/\d{4}/).trim().escape(),
  check('cvv','Please enter a valid CVV').matches(/^\d{3,4}$/).isInt().trim().escape(),
  async (req, res) => {
    const errorsResult = validationResult(req);
    if (!errorsResult.isEmpty()) {
      res.send({success: false, errors: errorsResult.errors});
    }else{
      const mongoRes = await Card.create({user: req.user, ...req.body});
      console.log(`A document was inserted with the _id: ${mongoRes._id}`);
      res.send({success: true});
    }
  }
);

app.get('/cards', isAuth,
  async (req,res) => {
      let entries = await Card.find({user: req.user});
      if(entries.length === 0){
        entries = [
          {
            bank: "-",
            cardnum: "-"
          }
        ]
      }
      res.send({entries});
  }
)

app.get('/verify', 
  (req, res)=> {
    if(req.isAuthenticated()){
      res.send({isLoggedIn: true});
    }else{
      res.send({isLoggedIn: false});
    }
  })

app.use(express.static(path.join(__dirname, "../build/")));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/', 'index.html'));
});
  
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});