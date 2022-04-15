const mongoose = require('mongoose')

const Users = new mongoose.Schema({
  username : String,
  password : String,
}, {
  collection : `users`
})

module.exports = new mongoose.model('Users', Users)
