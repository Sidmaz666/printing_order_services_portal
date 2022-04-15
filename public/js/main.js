function ToggleHelp(){
  document.getElementById('help').classList.toggle('hidden')
  document.body.classList.toggle('overflow-y-hidden')
}

function showErrMsg(){
  const isAdmin = window.location.href.includes('/admin') 
  const path = window.location.pathname 
  
  const select_target = document.getElementById('error-msg')
  fetch('https://dog.ceo/api/breeds/image/random')
    .then(response => response.json())
    .then((data) => {

      const imgLink = data.message
      select_target.innerHTML = `
	<span
	class="
	text-xl
	text-center
	p-2
	md:p-5
	"
	>
	<i class="text-red-500">Error 404!</i> The 
	<b class="text-cyan-500">${path}</b>
	Page Does Not Exist.
	<br>
	<span>Redirecting in  <b id="re-timer"></b> ...</span> 	
	</span>
      <img 
      	src=${imgLink} 
	class="h-60 md:h-72 w-full rounded-b-lg"
	 />
	`

      let num = 5
      const redirect = setInterval(() => {
	document.getElementById('re-timer').innerText = num
	num = num - 1
	if(num == 0){
	  if(isAdmin == true){
	    window.location = '/admin'
	  } else {
	    window.location = '/'
	  }
	}
		
      },1000)

      redirect

    })
}

async function updateTokken(){
  const select_target = document.getElementById('tokken-no')
  
  let num = 0
  select_target.innerText = num
  setInterval(async () => {

    	const response =  await fetch('/api/fetch_tokken')
   	const data = await response.json()

    	select_target.innerText = `${data.current_tokken}/${data.total_tokken}`
	  
      	},3000)

  }

