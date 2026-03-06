import { useState, useEffect } from "react"

export default function EarningsCard({earned, perSecond}){

const [display,setDisplay] = useState(0)

useEffect(()=>{

let frame

function animate(){

setDisplay(d=>{
const diff = earned - d

if(Math.abs(diff) < 0.001){
return earned
}

return d + diff * 0.1
})

frame = requestAnimationFrame(animate)

}

animate()

return ()=>cancelAnimationFrame(frame)

},[earned])

const card={
background:"#0f223f",
padding:"20px",
borderRadius:"12px"
}

return(

<div style={card}>

<h3>Live Earnings</h3>

<h1>${display.toFixed(2)}</h1>

<p>${perSecond.toFixed(4)} / sec</p>

</div>

)

}
