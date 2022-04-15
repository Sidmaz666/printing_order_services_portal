const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const crypto = require('crypto');
const path = require('path')
const { createReadStream, unlinkSync } = require('fs')
const Razorpay = require('razorpay')
const fast2sms = require('fast-two-sms')
const { createModel, createBucket } = require('mongoose-gridfs')

const UserModel = require('./Usermodel')
const OrderModel = require('./Ordermodel');
const TokkenModel = require('./Tokkenmodel');
require('dotenv').config()

const algorithm = 'aes-256-cbc'
const key = crypto.randomBytes(32)
const iv = crypto.randomBytes(16)

function encrypt(text) {
   let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
   let encrypted = cipher.update(text);
   encrypted = Buffer.concat([encrypted, cipher.final()]);
   return { id: iv.toString('hex'), data: encrypted.toString('hex') };
}

function decrypt(text) {
   let iv = Buffer.from(text.id, 'hex');
   let encryptedText = Buffer.from(text.data, 'hex');
   let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
   let decrypted = decipher.update(encryptedText);
  try{
   decrypted = Buffer.concat([decrypted, decipher.final()]) ;
   return decrypted.toString();
  } catch (err){
    console.log(err)
    //Heavy Security Here
    return false
  }
}

function verifyUser(req,res){
  const db_uri = process.env.DB_URI
  const username = req.body.username
  const pass = req.body.pass
   mongoose.connect(db_uri,{useNewUrlParser: true, useUnifiedTopology: true})
       .then(() => {
	 UserModel.find({}, (err, items) => {
        if (err) {
            console.log(err)
        }
        else {
	  
	  let checkPass, f_username, f_pass = false
	  for(let y=0;items.length > y ; y++){
	    if(items[y].username == username){
	      f_username = true

	    }
	    const f_pass = items[y].password
	    if(bcrypt.compareSync(pass, f_pass) == true){
	      checkPass = true
	    }
	  }


	    if(f_username == true){
	      if(checkPass == true){
		const isAuth = true
		const key = {
		  items,
		  checkPass,
		  isAuth,
		}
		const prepare_cookie = encrypt(JSON.stringify(key))
		res.cookie("UserLog", prepare_cookie, {
		  maxAge :  24 * 60 * 60 * 1000,
		  httpOnly: true
		})
		res.status(200).json({ key , isAuth })
		return
	      } else  {
		res.status(200).json({ error : 606 })
		return
	      }
	    } else  {
	      res.status(200).json({ error : 706 })
	      return
	    }
        }
    });
       })
       .catch(err => {
         console.error('Database connection error')
       })

}

function checkUserCookie(req,res){
  	const userData = JSON.parse(req.cookies.UserLog && decrypt(req.cookies.UserLog) || false)
  	const isAuth = userData.isAuth
  	const second_check = userData.checkPass
  	if(userData !== false) {
	if(isAuth == true){
	  if(second_check == true){
	    const uri = process.env.DB_URI
	    mongoose.connect(uri, {useNewUrlParser: true, useUnifiedTopology: true})
	      .then(() => {

		 OrderModel.find({}, (err,item) => {
		
		    res.render('admin/index' , { items : item } )

	      })
	  })


	  } else {
	    res.render('admin/auth')
	  }
	} else {
	  res.render('admin/auth')
	}

	} else {
	  res.render('admin/auth')
	}

}


function placeOrder(req,res){

  const { 
  	  customer_name ,
  	  phone_number,
	  size,
	  total_file,
	  type,
	  color
  	} = req.body 


  let price 

  if(size == 1){
    if(color == 2){
      price = 10
    } else {
    price = 5
    }
  } else if(size == 2){
    if(color == 1){
      price = 15
    } else {
    price = 20
    }
  } else if(type == 3){
    price = 40
  } else {
    if(color == 1){
      price = 10
    } else {
      price = 20
    }
  }

  let isSize 
  if(size == 1){
    isSize ="A4"
  } else if(size == 2){
    isSize = "Passport"
  } else {
    isSize = "Full Photo"
  }


  price = price * total_file * 100
 
  let isType
  if(type == 1){
	isType = "Document"
  } else if(isType == 2){
    isType = "Photo"
  } else {
    isType = "Lamination"
  }

  const files = req.files
  let isflieUploaded = true 
  const fileUploadLinks = []

  for(let k in req.files){
    const file = req.files[k]
    let file_ext = path.extname(file.name)
    if(file_ext == '.ocx'){
      file_ext = '.docx'
    }
    const fileName = crypto.randomBytes(16).toString('hex') + file_ext
    const uploadPath =  `public/uploads/${fileName}` 
    let localLink = `uploads/${fileName}`
    fileUploadLinks.push({
      localLink,
    })
    file.mv(uploadPath ,(err) => {
      if(err){
	isflieUploaded = false
      console.log(err)
      } 
    })
  }


  let user_data = {
  	  customer_name ,
  	  phone_number,
	  size : isSize,
	  total_file,
	  type : isType,
	  color
  }

  const KEY = process.env.KEY
  const KEY_SEC = process.env.KEY_SECRET

  const instance = new Razorpay({
    key_id : KEY,
    key_secret : KEY_SEC
  })

  const randomId = "order_id_" + crypto.randomBytes(10).toString('hex')

  const order = {
    amount : price,
    currency : "INR",
    receipt: randomId,
    notes : user_data
  }



    instance.orders.create(order,  function(err,respond){
    const user_order = respond
    res.status(200).json({ user_order , fileUploadLinks , KEY })
      if(err){
      console.log("Error : " , err)
    }
  })


}

function verifyOrder(req,res){

	const db_uri = process.env.DB_URI
  	let isPaymentValid = false
  	const rz_pid = req.body.id
  	const o_id = req.body.oid
  	const rz_signature = req.body.rz_sig

  	const ArrayToJson = JSON.parse(JSON.stringify(Object.assign({}, req.body.fileLinks)))
  	// Local file Links
  	const uploadedFiles = []
	
  	for(let x in ArrayToJson){
	  	const file_path = path.join(__dirname.replace('functions',''), 'public', ArrayToJson[x].file_link)
		uploadedFiles.push(
		    file_path
		)
  	}
	
  	const user_info = req.body.us_d
	const customer_phone_number = req.body.us_d.phone_number
  	const files = []
  	for(let x in uploadedFiles){
		const name = uploadedFiles[x].replaceAll('/home/random/Documents/http/www/Node/printing_services/public/uploads/', '')
	  	files.push( name )
  	}


  	

	mongoose.connect(db_uri,{useNewUrlParser: true, useUnifiedTopology: true})
    	.then(async () => {
	    const FileUpload = createModel()
	    console.log('Connected')
	    for(let x in files){
	      const file_name = files[x]
	      const file_path = uploadedFiles[x]
	      const writeData = createReadStream(file_path)
	      const options = ({ filename : file_name })
	      FileUpload.write(options, writeData, (err,f) => {
		if(err){
		  console.log('Error : ', err)
		}
		if(f){
		  console.log('Uploaded :', f.filename)
		  unlinkSync(file_path)
		}
	      })
	  }


	       const order_complete = false
		  
		TokkenModel.find({}, async (err,items) => {


 		let tokken = items[0].total_tokken + 1


		 OrderModel.find({}, async (e,itm) => {
		  

		   const total_orders = itm.length + 1 == tokken ? true : false
		    
		   if(total_orders){


		     tokken = itm.length + 1

		    await TokkenModel.findOneAndUpdate({
		    total_tokken : tokken
		    }).catch(err => {
		    console.log(err.message)
		    })


		   }


		 })


		const userData = {
		  user_info,
		  files,
		  order_complete,
		  user_tokken : tokken || 0
		  }

		  const save_order = async () => {
		  await new OrderModel(userData).save()
		  }

		  const send_cus_sms = async () => {

		const customer_options = {authorization : process.env.F_KEY , message : `Dear Customer! Your Order has been placed. Order ID/Tokken ${tokken}` ,  numbers : [`${customer_phone_number}`]}
		const admin_options = {authorization : process.env.F_KEY , message : `For Admin : A New Order has been placed. Order ID/Tokken ${tokken}` ,  numbers : [`${process.env.ADMIN_PNO}`]}

		//SMS to client
		   
		    const sc = async () => {
		      const send_client_sms = await fast2sms.sendMessage(customer_options)
		      console.log(send_client_sms)
		    }


		//SMS to Admin
		    const ac = async () => {
		      const send_admin_sms = await fast2sms.sendMessage(admin_options)
		      console.log(send_admin_sms)
		    }
		

		    	await sc()
		    	await ac()


		  }

		  save_order()
		  send_cus_sms()
		})

	  
	}).catch(err => {
		console.log('Error : ', err)
	})

	

	const gen_sig = crypto.createHmac('sha256', process.env.KEY_SECRET).update(`${o_id}|${rz_pid}`).digest('hex')  	

  	if(gen_sig == rz_signature){
	isPaymentValid = true
  	}

	res.status(200).json({ status : isPaymentValid })
}


async function fetchTokken(req,res){

  const uri = process.env.DB_URI
  mongoose.connect(uri,{useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => {
	
      TokkenModel.find({}, async (err, items) => {

		const current_tokken = items[0].current_tokken
		const total_tokken = items[0].total_tokken
		const data = { current_tokken , total_tokken }
		res.status(200).json( data )


      })


    })

}

async function getFile(req,res){
  	const filename = await req.query.filename
	if(typeof filename == 'undefined'){
	res.status(200).json({ message : "Error Provide a Filename" })
	} else {
	const uri = process.env.DB_URI	  
	mongoose.connect(uri,{useNewUrlParser: true, useUnifiedTopology: true})
	.then(async () => {
	
	  const GetFile = createBucket()

	  GetFile.findOne({ filename }, function (err, file) {
	    if (err) {
	  return res.status(400).send(err);
	  }
	    else if (!file) {
	  return res.status(404).send('Error on the database looking for the file.');
	  }

	      res.set('Content-Type', file.contentType);
	      res.set('Content-Disposition', 'attachment; filename="' + file.filename + '"');

	      const readstream = GetFile.createReadStream({
	      _id: file._id,
	      root: 'resume'
	  })

	      readstream.on("error", function(err) {
	      res.end();
	    })
	    readstream.pipe(res);
      })
      
	})	  
}

}

async function updateOrder(req,res){
	const order_id = req.query.id
	const customer_phone_number =  req.query.pno
  	const tokken = req.query.tokken

  	if(typeof order_id == "undefined"){
		res.status(200).json({ message : "Error Provide Order ID" })
	} else {
	  const uri = process.env.DB_URI

	mongoose.connect(uri,{useNewUrlParser: true, useUnifiedTopology: true})
	.then(async () => {
	
	    const order_complete = true
	  OrderModel.findOneAndUpdate( { _id : order_id },{ order_complete : true }, async (er) => {

	      if(er){
		console.log(er)
		res.status(200).json({ message : "Error Something Went Wrong" })
	      } else {


		  const send_cus_sms = async () => {

		const customer_options = {authorization : process.env.F_KEY , message :`Dear Customer! Your Order is Ready To Pick up. Order ID/Tokken ${tokken}` ,  numbers : [`${customer_phone_number}`]}

		//SMS to client
		   
		    const sc = async () => {
			  const send_client_sms = await fast2sms.sendMessage(customer_options)
			  console.log(send_client_sms)
		    } 


		    await sc()

		

		  }


		TokkenModel.find({} , async (e,f) => {

			
		  const tid = f[0]._id
		  const crr_tok = f[0].current_tokken
		  const up_yok = crr_tok + 1

		await TokkenModel.findOneAndUpdate({ current_tokken : up_yok })
		    .then(() => {

			res.status(200).json({ order_complete })
			send_cus_sms()


		    })

		})

	      }

	    })

	})
	}
}

module.exports = { 
  		verifyUser ,
  		checkUserCookie ,
  		placeOrder,
  		verifyOrder,
		fetchTokken,
  		getFile,
  		updateOrder
		}
