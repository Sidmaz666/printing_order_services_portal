
document.querySelectorAll('#order-display >  button').forEach((e) => {
  e.addEventListener('click', async function(){
  
    	const id = e.getAttribute('data-id')
    	const pno = e.getAttribute('data-pno')
    	const tokken = e.getAttribute('data-tok')
    	const res = await fetch(`/api/update_order?id=${id}&pno=${pno}&tokken=${tokken}`)
    	const data = await res.json()
    	
    	this.parentElement.textContent = data.order_complete
	this.style.display = "none"
    	

  })
})
