export default function EarningsHeatmap({history}){

const card={
background:"#0f223f",
padding:"20px",
borderRadius:"12px"
}

const grid={
display:"grid",
gridTemplateColumns:"repeat(7,1fr)",
gap:"6px",
marginTop:"10px"
}

function color(amount){

if(amount>150) return "#22c55e"
if(amount>100) return "#4ade80"
if(amount>50) return "#86efac"
if(amount>10) return "#14532d"

return "#1e293b"

}

return(

<div style={card}>

<h3>Earnings Heatmap</h3>

<div style={grid}>

{history.slice(-28).map((h,i)=>{

return(

<div
key={i}
style={{
height:"20px",
borderRadius:"4px",
background:color(h.earnings)
}}
/>

)

})}

</div>

</div>

)

}
