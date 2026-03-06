import React, { useEffect, useState } from "react";

export default function App() {

const hourlyRate = 22;

const [working, setWorking] = useState(false);
const [earnings, setEarnings] = useState(0);
const [startTime, setStartTime] = useState(null);

const [schedule] = useState([
{ day: "Mon", start: "11:00", end: "19:30" },
{ day: "Thu", start: "11:00", end: "19:30" },
{ day: "Fri", start: "12:00", end: "20:30" },
{ day: "Sat", start: "11:00", end: "19:30" },
{ day: "Sun", start: "11:00", end: "19:30" }
]);

const perSecond = hourlyRate / 3600;

function calculateWeeklyHours(schedule) {
let total = 0;

schedule.forEach(shift => {

const [sh, sm] = shift.start.split(":").map(Number);
const [eh, em] = shift.end.split(":").map(Number);

const start = sh + sm / 60;
const end = eh + em / 60;

total += end - start;

});

return total;
}

const weeklyHours = calculateWeeklyHours(schedule);
const weeklyProjection = weeklyHours * hourlyRate;

function toggleShift(){

if(!working){
setWorking(true);
setStartTime(Date.now());
}else{
setWorking(false);
}

}

useEffect(()=>{

let interval;

if(working){

interval = setInterval(()=>{

setEarnings(prev => prev + perSecond);

},1000);

}

return ()=> clearInterval(interval);

},[working]);

const styles = {

app:{
background:"#07152a",
minHeight:"100vh",
color:"white",
padding:"30px",
fontFamily:"sans-serif"
},

title:{
fontSize:"32px",
marginBottom:"20px"
},

card:{
background:"#0d223f",
padding:"20px",
borderRadius:"12px",
marginBottom:"20px"
},

cardValue:{
fontSize:"26px",
marginTop:"5px"
},

button:{
padding:"15px",
border:"none",
borderRadius:"10px",
color:"white",
fontSize:"16px"
}

};

return (

<div style={styles.app}>

<div style={styles.title}>
Work<span style={{color:"#22c55e"}}>Worth</span>
</div>

<div style={styles.card}>
<div>Live Earnings</div>
<div style={styles.cardValue}>
${earnings.toFixed(2)}
</div>
<div>
+${perSecond.toFixed(4)} / sec
</div>
</div>

<div style={styles.card}>
<div>Shift</div>

<button
onClick={toggleShift}
style={{
...styles.button,
background: working ? "#ef4444" : "#22c55e"
}}
>

{working ? "End Shift" : "Start Shift"}

</button>

</div>

<div style={styles.card}>
<div>Weekly Projection</div>

<div style={styles.cardValue}>
${weeklyProjection.toFixed(2)}
</div>

</div>

<div style={styles.card}>
<div>Schedule</div>

{schedule.map((shift,i)=>(
<div key={i}
style={{
display:"flex",
justifyContent:"space-between"
}}>

<span>{shift.day}</span>
<span>{shift.start} - {shift.end}</span>

</div>
))}

</div>

</div>

);

}
