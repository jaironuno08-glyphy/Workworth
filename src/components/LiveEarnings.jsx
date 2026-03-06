export default function LiveEarnings({ earned, perSecond }) {

const card={
background:"#0f223f",
padding:"22px",
borderRadius:"14px",
marginBottom:"22px"
}

return(

<div style={card}>

<h3>Live Earnings</h3>

<h1>${earned.toFixed(2)}</h1>

<p>${perSecond.toFixed(4)} / sec</p>

</div>

)

}
