const API = "https://noely-rent.onrender.com/api/properties"

async function loadProperties(){

document.getElementById("loader").style.display="block"

const res = await fetch(API)

const properties = await res.json()

document.getElementById("loader").style.display="none"

const container = document.getElementById("property-list")

container.innerHTML=""

properties.forEach(prop=>{

container.innerHTML += `

<div class="property-card">

<a href="property.html?id=${prop._id}">
<img src="${prop.image || 'images/placeholder.jpg'}">
</a>

<div class="property-details">

<h3>${prop.title}</h3>

<p>${prop.location}</p>

<p class="price">₦${prop.price}</p>

<div class="contact">

<a href="https://wa.me/${prop.phone}">
<img src="images/whatsapp-icon.png">
</a>

<a href="tel:${prop.phone}">
<img src="images/call-icon.png">
</a>

</div>

</div>

</div>

`

})

}

loadProperties()

function toggleMenu(){

document.getElementById("menu").classList.toggle("show")

}