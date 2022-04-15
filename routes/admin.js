const express = require('express')
const router = express.Router()
const cookie_parser = require('cookie-parser')
const { checkUserCookie } = require('../functions/main')

router.use(express.static('public'))
router.use(cookie_parser())

router.get("/", (req,res) => {
  checkUserCookie(req,res)
})

router.get("/login", (req,res) => {
  checkUserCookie(req,res)
})

router.get("/logout", (req,res) => {
  	res.clearCookie("UserLog")
  	res.redirect('/admin/login')
})


router.use("/*", express.static('public/html/error.html') )

module.exports = router
