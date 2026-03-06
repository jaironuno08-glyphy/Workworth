export default function FocusMode({earned,perSecond,exit}){

return(

<div style={{
background:"#071428",
color:"white",
height:"100vh",
display:"flex",
flexDirection:"column",
justifyContent:"center",
alignItems:"center",
textAlign:"center"
}}>

<h1 style={{fontSize:"80px"}}>
${earned.toFixed(2)}
</h1>

<p style={{fontSize:"22px"}}>
earned this shift
</p>

<p style={{marginTop:"20px"}}>
${perSecond.toFixed(4)} / second
</p>

<button
onClick={exit}
style={{
marginTop:"40px",
padding:"12px 20px",
borderRadius:"10px",
border:"none",
background:"#22c55e",
color:"white"
}}
>

Exit Focus Mode

</button>

</div>

)

}
