const mongoose = require('mongoose')

const Order = new mongoose.Schema({
  user_info: Object,
  files : Array,
  order_complete : Boolean,
  user_tokken : Number,
  created_time : { type : Date, default: Date.now }
}, {
  collection : `orders`
})

module.exports = new mongoose.model('orders', Order)
