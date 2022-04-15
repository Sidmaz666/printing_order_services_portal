const select_LoginPass = document.getElementById('password') 
const select_LoginUser = document.getElementById('username') 
const select_errorDisplay = document.getElementById('err-msg')

let validateUsername 
let validatePassword

function showErr(msg,opt,cls){
  if(opt == "add"){
  select_errorDisplay.classList.add(cls)
  }  else {
  select_errorDisplay.classList.remove(cls)
  }
  select_errorDisplay.innerText = msg
}

function checkPass(pass, num , cuser){
  if(pass.length < num){
    if(cuser == true){
	select_LoginUser.style.borderColor = "red"
      	showErr("User Name Too short", "", 'hidden')
      	validateUsername = false
    } else {
      	showErr("Password Too short", "", 'hidden')
	select_LoginPass.style.borderColor = "red"
	validatePassword = false

    }
  } else {
    if(cuser == true){
      	showErr("", "add", 'hidden')
	select_LoginUser.style.borderColor = "#0097A790"
      	validateUsername = true

    } else {
      	showErr("", "add", 'hidden')
	select_LoginPass.style.borderColor = "#0097A790"
      	validatePassword = true

    }
  }
}


const select_LoginForm = document.getElementById('login-form')
select_LoginForm.addEventListener("submit", function(e){
  e.preventDefault()
  checkFormValidity()
})

function checkFormValidity(){
  	const isValid = (re) => {
	  if(validatePassword == true){
	    if(validateUsername == true){
	      		re = true
			return re
	    } 
	  } 
  	}
   isValid() == true && processForm()  
}

function processForm(){
  	document.querySelector(`button[type=submit]`).classList.add('cursor-not-allowed')
  	document.querySelector(`button[type=submit]`).classList.add('opacity-50')
  	document.querySelector(`button[type=submit]`).setAttribute("disabled", true)
	const username = select_LoginUser.value
  	const pass = select_LoginPass.value
	const data = { username , pass };

	fetch('/api/login', {
	method: 'POST',
	headers: {
	'Content-Type': 'application/json',
      },
	body: JSON.stringify(data),
    })
	.then(response => response.json())
	.then(data => {
	  let isAuth = false
	  if(data.error == 706){
	    showErr("Username Does Not Exist", "", "hidden")
	  } else if(data.error == 606 ){
	    showErr("Wrong Password", "", "hidden")
	  } else {
	    isAuth = true
	  } 
	  if(isAuth == true){
	   window.location = "/admin"
	  }
	  })
	.catch((error) => {
	  console.error('Error:', error);
  });

}
