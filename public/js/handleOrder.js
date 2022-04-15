let isValid 
let isReallyValid = false
let important_id, pay_amount, user_info , rz_key, us_d
const fileLinks = []

function showErr(id,msg,elm,col){
	const sel = document.getElementById(id || 'err-msg')
	sel.classList.remove('hidden')
  	sel.innerText = msg
	elm.style.borderColor = col || "#D5000090"
  	isValid = false
}


function hideErr(id,elm){
	const sel = document.getElementById(id || 'err-msg')
  	sel.classList.add('hidden')
  	sel.innerText = ""
	elm.style.borderColor = "#26C6DA50"
  	isValid = true
}

function manageSizeType(id , val ){

  const mkFalse = (id) => {
    document.querySelectorAll(id).forEach((e) => {
      e.removeAttribute("selected")
    })
  }

  if(id == "size"){
    if(val == 2 || val == 3){
      mkFalse('#type > option')
      document.querySelectorAll('#type > option')[1].setAttribute("selected", "")
    } else {
      mkFalse('#type > option')
      document.querySelectorAll('#type > option')[0].setAttribute("selected", "")
    }
  } else {
    if(val == 2) {
      mkFalse('#size > option')
      document.querySelectorAll('#size > option')[1].setAttribute("selected", "")
	
    } else {
      if(document.getElementById('size').value == 2 ){
		mkFalse('#size > option')
      document.querySelectorAll('#size > option')[0].setAttribute("selected", "")

      }
    }
  }
}

document.querySelectorAll('#size , #type').forEach((a) => {
  a.addEventListener('click', function(){
    manageSizeType(a.id, a.value )
  })
	
})


function formatBytes(a,b=2,k=1024){with(Math){let d=floor(log(a)/log(k));return 0==a?"0 Bytes":parseFloat((a/pow(k,d)).toFixed(max(0,b)))+" "+["Bytes","KB","MB","GB","TB","PB","EB","ZB","YB"][d]}}


const sel_file = document.querySelector('#subFile')
sel_file.onchange = (e) => {
    if(sel_file.files.length > 20){
      showErr('err-upload-file', '20 is the File Limit', sel_file, '#BA68C850')
    } else {
      hideErr('err-upload-file', sel_file)
      for(let x=0;sel_file.files.length > x ; x++){
	const file = sel_file.files[x]
	const type = file.type 
	const size = file.size
	if(type == "image/jpg" || type == "image/jpeg" || type == "image/png" || type == "application/pdf" || type == "application/docx" || type == "application/msword" || type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ){
	
	  if(size <= 5242880){
	  isValid = true
	  isReallyValid = true

	  } else {
	    isReallyValid = false
	    showErr('err-upload-file', `${file.name} : Size ${formatBytes(size)} is too big. File size limit is 5MB`, sel_file, '#BA68C850')
	  }
	} else {
	    isReallyValid = false
	    showErr('err-upload-file', 'Invalid File Found. Supported Files are PNG, JPG, PDF, DOC and DOCX', sel_file, '#BA68C850')
	}
      }
    }
}

function validatePhoneNum(){
  const tx = document.getElementById("phone-number").value
  const  r = /^[6-9]\d{9}$/
  if(r.test(tx)){
    hideErr('err-phone-number',  document.getElementById("phone-number"))
  } else {
    showErr('err-phone-number', 'Invalid Phone Number',  document.getElementById("phone-number"))
  }
}


	const select_target = document.getElementById('order-form')
  	select_target.addEventListener('submit',  function(e){
			e.preventDefault()
	  		placeOrder(e)
			
  	})



async function placeOrder(e){
  validatePhoneNum()
  if(isValid == true && isReallyValid == true){
    hideErr('err-msg', document.querySelector('button[type=submit]'))

   const customer_name = document.getElementById('name').value
   const phone_number =  document.getElementById('phone-number').value
   let total_file = document.getElementById('total-file').value
   const size = document.getElementById('size').value
   const color = document.getElementById('color').value
   const files  = document.getElementById('subFile').files
    if(total_file !== files.length){
    	total_file = files.length
    }

   let type = document.getElementById('type').value
   
    if(size == 2){
      type = 2
    }

   
  	document.querySelector(`button[type=submit]`).classList.add('cursor-not-allowed')
  	document.querySelector(`button[type=submit]`).classList.add('opacity-50')
  	document.querySelector(`button[type=submit]`).setAttribute("disabled", true)
    	
    const genForm = new FormData()
    genForm.append("customer_name", customer_name)
    genForm.append("phone_number", phone_number)
    genForm.append("total_file", total_file)
    genForm.append("size", size)
    genForm.append("type", type)
    genForm.append("color", color)

    for(let x=0;files.length > x; x++){
      genForm.append(`${x}`, files[x])
    }


    const url = '/api/order'
    const req = new Request(url, {
      method : 'POST',
      body: genForm
    })
    const response = await fetch(req)
    const data = await response.json()

    data.fileUploadLinks.forEach((link) => {
      const file_link = link.localLink
      fileLinks.push({ file_link })
    })

    rz_key = data.KEY 
    if(rz_key !== ""){
  	document.querySelector(`button[type=submit]`).classList.add('cursor-pointer')
  	document.querySelector(`button[type=submit]`).classList.add('opacity-100')
  	document.querySelector(`button[type=submit]`).removeAttribute("disabled")
    }
    const price = data.user_order.amount / 100 + "RS"
    const order_id = data.user_order.id
    important_id = order_id
    pay_amount = data.user_order.amount
    user_info = data.user_order.notes
    const notes = data.user_order.notes
    
    us_d = notes

    const sel_main = document.querySelectorAll('div')[0]

    sel_main.innerHTML = `
	<span class="text-lg font-semibold capitalize"> ${notes.customer_name}</span>
	<br>
	<span>Phone Number : ${notes.phone_number}</span>
	<br>
	<span>Size : ${notes.size}</span>
	<br>
	<span>Type : ${notes.type}</span>
	<br>
	<span>Color : ${notes.color == 1 ? 'B&W' : 'RGB'}</span>
	<br>
	<span>Total Files Submitted : ${notes.total_file}</span>
	<br>
	<span>Amount : <b>${price}</b></span>
	<br>
    `
    	const cen = document.createElement('center')
	const btn = document.createElement('button')
    	cen.append(btn)
    	sel_main.append(cen)
	btn.id = "rzp-button1"
    	btn.setAttribute("onclick","submit_payment(event)")
    	btn.setAttribute("class"," p-2 pr-5 pl-5 text-lg ml-0 mt-4 font-semibold border rounded-md border-cyan-900 hover:bg-white hover:text-black  ")
	btn.textContent = "Pay"

  } else {
    showErr('', 'Something Went Wrong' , document.querySelector('button[type=submit]') )
  }
}



function submit_payment(e){
  e.preventDefault()
  const options = {
    "key" : rz_key,
    "amount" : pay_amount,
    "name" : "Printing Service",
    "order_id" : important_id,
    "handler" : function(response){
	const id = response.razorpay_payment_id
      	const oid = response.razorpay_order_id
      	const rz_sig = response.razorpay_signature
      	const data = {
	id,
	oid,
	rz_sig,
	us_d,
	fileLinks
      }
      fetch("/api/verify_order",{
	method : 'POST',
	headers : {
	'Content-Type' : 'application/json',
	},
	body : JSON.stringify(data)
      })
	.then(res => res.json())
	.then(g_dat => {
	  if(g_dat.status == true) {
	   	const sel_spa = document.querySelectorAll('span')[0]
	    	document.querySelectorAll('span')[1].style.display = "none"
	   	sel_spa.textContent = "Payment Successfull"
	  	const c_br = document.createElement('br')
	  	sel_spa.append(c_br)
	    	const create_b = document.createElement('b')
	  	create_b.id = "cnt-dwn"
	  	create_b.setAttribute("class","text-sm")
	  	sel_spa.append(create_b)
	  	let num = 10
	  	document.querySelectorAll('div')[0].style.display = "none"
	  	document.body.classList.add("justify-center")
	  	setInterval(() => {
		document.getElementById('cnt-dwn').textContent = "Redirecting in " + num + "..."
	    	if(num == 0){
	      	window.location = "/"
	    	}
	    	num = num - 1
	  	},1000)
	  } else {
	   	const sel_spa = document.querySelectorAll('span')[0]
	    	document.querySelectorAll('span')[1].style.display = "none"
	   	sel_spa.textContent = "Payment Failed"
	    setTimeout(() => {
	      window.location = "/"
	    },5000)
	  }

	})
    },
    "prefill" : {
      "name" : user_info.customer_name,
      "contact" : user_info.phone_number,
    },
    "notes" : {
      "size" : user_info.size,
      "type" : user_info.type,
      "color" : user_info.color,
      "total_files" : user_info.total_file
    },
    "theme": {
        "color": "#3399cc"
    }
  }

  const rzp1 = new Razorpay(options)
  rzp1.open()
}
