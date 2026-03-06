export default function TimeValueCard({rate}){

const perSecond = rate/3600
const perMinute = rate/60

const card={
background:"#0f223f",
padding:"20px",
borderRadius:"12px"
}

return(

<div style={card}>

<h3>Your Time Value</h3>

<p>${perSecond.toFixed(4)} per second</p>
<p>${perMinute.toFixed(2)} per minute</p>
<p>${rate} per hour</p>

</div>

)

}
