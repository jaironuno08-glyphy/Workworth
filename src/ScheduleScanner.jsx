import { useState } from "react";

export default function ScheduleScanner({ onScheduleDetected }) {

const [preview,setPreview] = useState(null);

function handleImage(e){

const file = e.target.files[0];

if(!file) return;

const url = URL.createObjectURL(file);

setPreview(url);

/*
Simulated schedule detection.
Later we can replace this with real OCR.
*/

if(onScheduleDetected){

onScheduleDetected([
{day:"Mon",hours:"11-7:30"},
{day:"Tue",hours:"Off"},
{day:"Wed",hours:"Off"},
{day:"Thu",hours:"11-7:30"},
{day:"Fri",hours:"12-8:30"},
{day:"Sat",hours:"11-7:30"},
{day:"Sun",hours:"11-7:30"}
]);

}

}

return(

<div style={styles.container}>

<h3>Upload Work Schedule</h3>

<input
type="file"
accept="image/*"
capture="environment"
onChange={handleImage}
/>

{preview && (
<img src={preview} style={styles.image}/>
)}

</div>

);

}

const styles = {

container:{
marginTop:"30px",
background:"#0f1f33",
padding:"20px",
borderRadius:"12px"
},

image:{
width:"100%",
marginTop:"15px",
borderRadius:"10px"
}

};
