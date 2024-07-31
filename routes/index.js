var express = require('express');
var router = express.Router();
const userModel = require("./users");
const postModel = require("./post");
const passport = require('passport');
const localStrategy = require('passport-local')

passport.use(new localStrategy(userModel.authenticate()))
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('dashboard', { title: 'Express' });
});

router.get('/register', function(req, res, next) {
  res.render('register');
});


// router.get('/admin', async (req, res) => {
//   // try {
//       console.log("inside try");
//       // Fetch posts from the database
//       const posts = await postModel.find().populate('author', 'username').populate('comments.author', 'username');
//           console.log(posts);

//       // Render the EJS template with the posts data
//       res.render('admin', { posts });
//   // } catch (err) {
//   //     console.error(err); // Log error for debugging
//   //     res.status(500).json({ message: err.message });
//   // }
// });
router.get('/admin', isLoggedIn, async function(req, res, next) {
  const user = await userModel.findOne({username : req.session.passport.user});
  const posts = await postModel.find().then(posts => res.render('admin', {posts}));
  console.log(posts);

});


router.post('/login', passport.authenticate("local",{
  failureRedirect : "/",
  successRedirect : "/admin"
}), function(req, res, next) {
  const data = new userModel({
    username : req.body.username,
    contact : req.body.contact,
    email : req.body.email,
  })

  userModel.register(data, req.body.password)
  .then(function(){
    passport.authenticate("local")(req, res, function(){
      res.redirect("/admin")
    })
  })
});

router.post('/register', function(req, res, next) {
  const data = new userModel({
    username : req.body.username,
    contact : req.body.contact,
    email : req.body.email,
  })

  userModel.register(data, req.body.password)
  .then(function(){
    passport.authenticate("local")(req, res, function(){
      res.redirect("/admin")
    })
  })
});

router.get("/logout", function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
}
res.redirect('/');
}

router.get('/posts/new', (req, res) => {
  console.log("inside new posts")
  res.render('createpost');
});
router.post('/posts', async (req, res) => {
  try {
      const { title, description, imageUrl, category, rating } = req.body;
      const newPost = await postModel.create({ title, description, imageUrl, category, rating, author: req.user._id });
      res.status(201).redirect('/admin'); // Redirect to dashboard after creation
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
});
router.get('/posts', async (req, res) => {
  try {
      const posts = await postModel.find().populate('author', 'username').populate('comments.author', 'username');
      res.json(posts);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
});

router.post('/posts/:postId/comments', async (req, res) => {
  try {
      const post = await postModel.findById(req.params.postId);
      const comment = { text: req.body.text, author: req.user._id };
      post.comments.push(comment);
      await post.save();
      res.status(201).json(post);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
});

router.post('/posts/:postId/rating', async (req, res) => {
  try {
      const post = await postModel.findById(req.params.postId);
      post.rating = req.body.rating;
      await post.save();
      res.status(201).json(post);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
});
// router.get('/edit/:id', async (req, res) => {
//   try {
//       const post = await postModel.findById(req.params.id);
//       res.render('editPost', { post });
//       res.redirect("/admin")
//   } catch (error) {
//       console.error(error);
      
//       res.status(500).send('Internal Server Error');
//   }
// });
router.put('/edit/:id', async (req, res) => {
  try {
    const post = await postModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(post);
    } catch (err) {
      res.status(500).json({ message: err.message });
      }
      });

      // router.get('/dashboard', function(req, res, next) {
      //   res.render('dashboard', { title: 'Express' });
      // });
      router.get('/login', function(req, res, next) {
        res.render('index', { title: 'Express' });
      });

module.exports = router;
