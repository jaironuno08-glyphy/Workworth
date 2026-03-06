export default function GoalCard({total,goal}){

const progress = Math.min((total/goal)*100,100)

const card={
background:"#0f223f",
padding:"20px",
borderRadius:"12px",
marginTop:"20px"
}

return(

<div style={card}>

<h3>Weekly Goal</h3>

<p>${total.toFixed(2)} / ${goal}</p>

<div style={{
background:"#1e293b",
height:"16px",
borderRadius:"8px",
overflow:"hidden"
}}>

<div style={{
width:progress+"%",
background:"#22c55e",
height:"100%"
}}/>

</div>

</div>

)

}
