export default function BestShiftCard({best}){

const card={
background:"#0f223f",
padding:"20px",
borderRadius:"12px"
}

return(

<div style={card}>

<h3>🏆 Best Shift</h3>

<h1>${best.toFixed(2)}</h1>

<p>Try to beat your record</p>

</div>

)

}
