const mongoose = require('mongoose')

const Tokken = new mongoose.Schema({
  current_tokken: Number,
  total_tokken : Number,
}, {
  collection : `tokkens`
})

module.exports = new mongoose.model('tokkens', Tokken)
