const express = require('express')
const router = express.Router()
const fileUpload = require('express-fileupload')


const { 
  verifyUser,
  placeOrder,
  verifyOrder,
  fetchTokken, 
  getFile,
  updateOrder } = require('../functions/main')

router.use(fileUpload({
      useTempFiles : true,
      tempFileDir : '/tmp/',
      createParentPath : true,
      safeFileNames : true,
      preserveExtension	: true
}))
router.use(express.json())
router.use(express.static('public'))

router.get("/",(req,res) => {
  res.redirect('/')
} )

router.post("/login",  (req,res) => {
      verifyUser(req, res)
})

router.post("/verify_order", (req,res) => {
  	verifyOrder(req,res)
})

router.post("/order" , (req,res) => {
  	placeOrder(req,res)
})

router.get("/fetch_tokken", (req,res) => {
  	fetchTokken(req,res)
})


router.get("/get_file", async(req,res) => {
	getFile(req,res)
})


router.get("/update_order", async(req,res) => {
	updateOrder(req,res)
})

router.use("/*", express.static('public/html/error.html') )


module.exports = router
