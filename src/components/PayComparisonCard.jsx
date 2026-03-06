export default function PayComparisonCard({rate}){

const average = 27

const diff = rate - average

const card={
background:"#0f223f",
padding:"20px",
borderRadius:"12px"
}

let message
let color

if(diff < 0){
message = `You are underpaid by $${Math.abs(diff)} / hr`
color = "#ef4444"
}
else if(diff > 0){
message = `You earn $${diff} more than average`
color = "#22c55e"
}
else{
message = "You are paid the local average"
color = "#facc15"
}

return(

<div style={card}>

<h3>📊 Pay Comparison</h3>

<p>Average Pay: $27/hr</p>

<p>Your Pay: ${rate}/hr</p>

<p style={{color}}>
{message}
</p>

</div>

)

}
