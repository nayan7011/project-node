var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const expressSession = require("express-session")
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const passport = require('passport');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const postRoutes = require('./routes/post');
const Post = require('./routes/post'); // Make sure to require your Post model
const User = require('./routes/users'); // Assuming you have a User model
const methodOverride = require('method-override');

// const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = "mongodb+srv://nayanrawat7011:Cp2UGpXtT4dhMCq2@cluster0.29v9qyh.mongodb.net/?retryWrites=true&w=majority&appName=cluster0";

// // Create a MongoClient with a MongoClientOptions object to set the Stable API version
// const client = new MongoClient(uri, {
//   serverApi: {
//     version: ServerApiVersion.v1,
//     strict: true,
//     deprecationErrors: true,
//   }
// });

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();
//     // Send a ping to confirm a successful connection
//     await client.db("admin").command({ ping: 1 });
//     console.log("Pinged your deployment. You successfully connected to MongoDB!");
//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);
  

const connectDB = async () =>{
  try{
    await mongoose.connect(process.env.MONGODB_CONNECT_URI)
    console.log("connect to MongoDB successfully")
  }catch (error){
    console.log("connect failed"+ error )
  }
}
var app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'your secret',
  resave: false,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/post',postRoutes);

// app.get('/dashboard', async (req, res) => {
//   try {
//       const posts = await Post.find().populate('author', 'username').populate('comments.author', 'username');
//       res.render('dashboard', { posts });
//   } catch (err) {
//       res.status(500).json({ message: err.message });
//   }
// });

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));


app.get('/posts/:id/edit', async (req, res) => {
  try {
      const post = await Post.findById(req.params.id);
      res.render('edit', { post });
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});

app.put('/posts/:id', async (req, res) => {
  const { title, description, imageUrl } = req.body;
  try {
      await Post.findByIdAndUpdate(req.params.id, { title, description, imageUrl });
      res.redirect('/admin'); // Redirect to admin after successful update
  } catch (err) {
      console.error(err);
      res.redirect('/admin'); // Redirect to admin in case of error
  }
});
app.delete('/posts/:id', async (req, res) => {
  try {
      await Post.findByIdAndDelete(req.params.id);
      res.redirect('/admin'); // Redirect to admin after successful deletion
  } catch (err) {
      console.error(err);
      res.redirect('/admin'); // Redirect to admin in case of error
  }
});

app.delete('/posts/:id', async (req, res) => {
  try {
      await Post.findByIdAndDelete(req.params.id);
      res.redirect('/admin'); // Redirect to admin after successful deletion
  } catch (err) {
      console.error(err);
      res.redirect('/admin'); // Redirect to admin in case of error
  }
});

app.get('/', async (req, res) => {
  try {
      const posts = await Post.find();
      res.render('dashboard', { posts });
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});
app.use(expressSession({
  resave : false,
  saveUninitialized : false,
  secret : "hey hey"
}))
app.use(passport.initialize())
app.use(passport.session());
passport.serializeUser(usersRouter.serializeUser())
passport.deserializeUser(usersRouter.deserializeUser())
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

const PORT = process.env.PORT
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;
