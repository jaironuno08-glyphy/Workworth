export default function ShiftButton({ working, toggleShift }) {

const card={
background:"#0f223f",
padding:"22px",
borderRadius:"14px",
marginBottom:"22px"
}

return(

<div style={card}>

<button
onClick={toggleShift}
style={{
padding:"16px",
width:"100%",
borderRadius:"10px",
border:"none",
fontSize:"16px",
fontWeight:"bold",
background: working ? "#ef4444" : "#22c55e",
color:"white",
cursor:"pointer"
}}
>

{working ? "End Shift" : "Start Shift"}

</button>

</div>

)

}
