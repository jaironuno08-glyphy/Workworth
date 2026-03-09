 GNU nano 8.7.1                          src/App.jsx
import { useState, useEffect } from "react"
import { Play, RotateCcw, Wallet } from "lucide-react"
import { CircularProgressbar, buildStyles } from "react-circular-progressbar"
import "react-circular-progressbar/dist/styles.css"

import { initializeApp } from "firebase/app"
import { getFirestore, doc, setDoc } from "firebase/firestore"

/* ---------------- FIREBASE ---------------- */

const firebaseConfig = {
  apiKey: "AIzaSyD0NIO-GnWWwJAUf30LRp6CWM",
  authDomain: "workworth-e0ce2.firebaseapp.com",
  projectId: "workworth-e0ce2",
  storageBucket: "workworth-e0ce2.appspot.com",
  messagingSenderId: "52262230347",
  appId: "1:52262230347:web:79de00b4370de"
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

/* ---------------- HELPERS ---------------- */

function money(n){
  return Number(n || 0).toLocaleString(undefined,{
    style:"currency",
    currency:"USD"
  })
}

function generateReferral(name){
  return name.replace(/\s/g,"").toUpperCase().slice(0,5) +
  Math.floor(Math.random()*1000)
}

/* ---------------- MAIN APP ---------------- */

export default function App() {

const userId = localStorage.getItem("ww_user") || crypto.randomUUID()
localStorage.setItem("ww_user", userId)

/* ---------------- STATE ---------------- */

const [page,setPage] = useState("home")

const [name,setName] = useState("")
const [job,setJob] = useState("")
const [workplace,setWorkplace] = useState("")
const [workLocation,setWorkLocation] = useState("")
const [hourly,setHourly] = useState(22)

const [working,setWorking] = useState(false)
const [seconds,setSeconds] = useState(0)
const [earnings,setEarnings] = useState(0)

const [lifetime,setLifetime] = useState(0)
const [wwc,setWwc] = useState(0)

const [referrals,setReferrals] = useState(0)
const [refCode,setRefCode] = useState("")

/* gigs */

const [gigName,setGigName] = useState("")
const [gigAmount,setGigAmount] = useState("")
const [gigs,setGigs] = useState([])

/* ---------------- CALCULATIONS ---------------- */

const rate = hourly / 3600
const realEarnings = seconds * rate
const progress = (seconds % 3600) / 3600 * 100
const referralLink = `${window.location.origin}?ref=${refCode}`

/* ---------------- EFFECTS ---------------- */

useEffect(()=>{

let timer

if(working){
 timer = setInterval(()=>{
  setSeconds(s=>s+1)
 },1000)
}

return ()=>clearInterval(timer)

},[working])
  GNU nano 8.7.1                          src/App.jsx
useEffect(()=>{

let frame

if(earnings < realEarnings){

frame = setInterval(()=>{

setEarnings(prev => {

const diff = realEarnings - prev
const step = diff * 0.15

if(Math.abs(diff) < 0.01){
return realEarnings
}

return prev + step

})

},40)

}

return ()=>clearInterval(frame)

},[realEarnings])

/* ---------------- ACTIONS ---------------- */

const startWork = ()=>{
 setWorking(true)
}

const stopWork = ()=>{

 setWorking(false)

 const earned = seconds * rate
 setLifetime(l=>l+earned)

}

const resetShift = ()=>{
 setSeconds(0)
 setEarnings(0)
}

const addGig = ()=>{

if(!gigName || !gigAmount) return

setGigs([
 ...gigs,
 {
  name:gigName,
  amount:Number(gigAmount)
 }
])

setGigName("")
setGigAmount("")
}

const saveProfile = async ()=>{

 const code = refCode || generateReferral(name)
 setRefCode(code)

 const profile = {
  name,
  job,
  workplace,
  workLocation,
  hourly,
  refCode: code
 }

 localStorage.setItem("ww_profile",JSON.stringify(profile))

 await setDoc(doc(db,"users",userId),profile)

 alert("Profile Saved")
}

/* ---------------- STYLES ---------------- */

const appStyle={
 background:"#05070d",
 minHeight:"100vh",
 padding:20,
  GNU nano 8.7.1                          src/App.jsx
 color:"white",
 fontFamily:"sans-serif"
}

const card={
 background:"#0c1220",
 padding:16,
 borderRadius:12,
 border:"1px solid #14223a",
 marginBottom:12
}

const button={
 padding:12,
 borderRadius:8,
 border:"none",
 cursor:"pointer"
}

const navBar={
 display:"flex",
 justifyContent:"space-around",
 marginTop:20
}

const navBtn={
 background:"#0c1220",
 color:"#39c8ff",
 border:"1px solid #1c355f",
 padding:10,
 borderRadius:8
}

const glowMoney={
 color:"#22ff88",
 fontWeight:"bold",
 textShadow:"0 0 10px #22ff88,0 0 20px #22ff88",
 animation:"pulseGlow 2s infinite"
}

const progressBar={
 height:8,
 width:"100%",
 background:"#0a1628",
 borderRadius:10,
 overflow:"hidden",
 marginTop:8
}

const progressFill=(value,color)=>({
 height:"100%",
 width:`${value}%`,
 background:color,
 boxShadow:`0 0 10px ${color}`
})



return(

<>
<div style={appStyle}>

<h1 style={{color:"#39c8ff"}}>WorkWorth</h1>
{page==="home" && (

<div style={card}>

<p>Earnings So Far</p>
<h1 style={glowMoney}>{money(earnings)}</h1>

<div style={progressBar}>
<div style={progressFill(progress,"#22ff88")}/>
</div>

<button
style={{...button,background:"#22ff88"}}
onClick={working?stopWork:startWork}
>
<Play size={18}/> {working?"Stop":"Start"}
</button>

<button
style={{...button,background:"#39c8ff"}}
onClick={resetShift}
>
<RotateCcw size={18}/> Reset
</button>

</div>

)}
{page==="wallet" && (

<div style={card}>

<h2><Wallet/> Wallet</h2>

<p>WWC Balance</p>

<h1 style={{color:"#22ff88"}}>
{wwc.toFixed(2)} WWC
</h1>

<h2 style={{color:"#39c8ff"}}>
{money(lifetime)}
</h2>

</div>

)}


{page==="friends" && (

<div style={card}>

<h2>Referrals</h2>

<p>Your Code: {refCode || "Not generated yet"}</p>

<p>{referralLink}</p>

<button
style={{...button,background:"#22ff88"}}
onClick={()=>navigator.clipboard.writeText(referralLink)}
>
Copy Invite Link
</button>

</div>

)}


{/* GIGS */}

{page==="gigs" && (

<div>

<div style={card}>
<h2>Money Hub</h2>
<p style={{color:"#9fb3d9"}}>Track side hustles and discover ways to earn</p>
</div>

{/* ADD GIG */}

<div style={card}>

<h3>Add Income</h3>

<input
placeholder="Gig name"
value={gigName}
onChange={e=>setGigName(e.target.value)}
style={{width:"100%",marginBottom:8}}
/>

<input
type="number"
placeholder="Amount"
value={gigAmount}
onChange={e=>setGigAmount(e.target.value)}
style={{width:"100%",marginBottom:8}}
/>

<button
style={{...button,background:"#22ff88"}}
onClick={addGig}
>
Add Gig
</button>

</div>

{/* USER GIG LIST */}

{gigs.map((g,i)=>(
<div key={i} style={card}>
{g.name} — {money(g.amount)}
</div>
))}

{/* APPS THAT PAY */}

<div style={card}>
<h3>Apps That Pay</h3>
<div style={marketCard}>🚗 Uber</div>
<div style={marketCard}>🍔 DoorDash</div>
<div style={marketCard}>🛒 Instacart</div>
</div>

{/* PLAY & TEST APPS */}

<div style={card}>
<h3>Play & Test Apps</h3>
<div style={marketCard}>🎮 FreeCash</div>
<div style={marketCard}>📱 Testerup</div>
<div style={marketCard}>🧪 UserTesting</div>
</div>


{page==="profile" && (

<div style={card}>

<h2>Profile</h2>

<input
placeholder="Name"
value={name}
onChange={e=>setName(e.target.value)}
/>

<input
placeholder="Job"
value={job}
onChange={e=>setJob(e.target.value)}
/>

<input
placeholder="Workplace"
value={workplace}
onChange={e=>setWorkplace(e.target.value)}
/>

<input
placeholder="Location"
value={workLocation}
onChange={e=>setWorkLocation(e.target.value)}
/>

<input
type="number"
placeholder="Hourly Pay"
value={hourly}
onChange={e=>setHourly(Number(e.target.value))}
/>

<button onClick={saveProfile}>
Save Profile
</button>

</div>

)}

<div style={navBar}>

<button style={navBtn} onClick={()=>setPage("home")}>Home</button>
<button style={navBtn} onClick={()=>setPage("wallet")}>Wallet</button>
<button style={navBtn} onClick={()=>setPage("friends")}>Friends</button>
<button style={navBtn} onClick={()=>setPage("gigs")}>Gigs</button>
<button style={navBtn} onClick={()=>setPage("profile")}>Profile</button>

</div>


</div>
</>
)