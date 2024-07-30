// models/Post.js

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const postSchema = new mongoose.Schema({
    title: String,
    description: String,
    imageUrl: String,
    category: String,
    rating: {
        type: Number,
        min: 0,
        max: 5
    },
    comments: [commentSchema],
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Post = mongoose.model('posts', postSchema);

module.exports = Post;
