import { useState } from "react"

export default function ScheduleCard(){

const [schedule,setSchedule] = useState([
{day:"Mon",time:"11:00 - 7:30"},
{day:"Thu",time:"11:00 - 7:30"},
{day:"Fri",time:"12:00 - 8:30"},
{day:"Sat",time:"11:00 - 7:30"},
{day:"Sun",time:"11:00 - 7:30"}
])

const card={
background:"#0f223f",
padding:"20px",
borderRadius:"12px"
}

return(

<div style={card}>

<h3>📅 Work Schedule</h3>

{schedule.map((s,i)=>(
<p key={i}>
{s.day}: {s.time}
</p>
))}

</div>

)

}
