import { useEffect, useState } from "react"

import Dashboard from "./components/Dashboard"
import EarningsCard from "./components/EarningsCard"
import GoalCard from "./components/GoalCard"
import ShiftButton from "./components/ShiftButton"
import TimeValueCard from "./components/TimeValueCard"
import EarningsHeatmap from "./components/EarningsHeatmap"
import EarningsChart from "./components/EarningsChart"
import StreakCard from "./components/StreakCard"
import CoinsCard from "./components/CoinsCard"
import TaxesCard from "./components/TaxesCard"
import BestShiftCard from "./components/BestShiftCard"
import FocusMode from "./components/FocusMode"
import PayComparisonCard from "./components/PayComparisonCard"
import PaycheckCard from "./components/PaycheckCard"
import LifetimeCard from "./components/LifetimeCard"
import ScheduleCard from "./components/ScheduleCard"
import ForecastCard from "./components/ForecastCard"
import TaxEstimatorCard from "./components/TaxEstimatorCard"

import { perSecond } from "./engine/payEngine"
import { useWorkStore } from "./store/workStore"

export default function App(){

const rate = 22
const weeklyGoal = 880

const store = useWorkStore()

const earned = store.earned
const working = store.working
const history = store.history
const coins = store.coins
const streak = store.streak
const best = store.best

const ps = perSecond(rate)

const [focus,setFocus] = useState(false)

useEffect(()=>{

let timer

if(working){

timer=setInterval(()=>{
store.setEarned(e=>e+ps)
},1000)

}

return ()=>clearInterval(timer)

},[working])

function toggleShift(){

if(working){
store.endShift()
}

store.setWorking(!working)

}

if(focus){

return(

<FocusMode
earned={earned}
perSecond={ps}
exit={()=>setFocus(false)}
/>

)

}

return(

<div style={{
background:"#071428",
minHeight:"100vh",
padding:"30px",
color:"white",
fontFamily:"sans-serif"
}}>

<h1>
Work<span style={{color:"#22c55e"}}>Worth</span>
</h1>

<button
onClick={()=>setFocus(true)}
style={{
marginBottom:"20px",
padding:"10px",
borderRadius:"8px",
border:"none",
background:"#22c55e",
color:"white"
}}
>
Focus Mode
</button>

<Dashboard>

<EarningsCard earned={earned} perSecond={ps} />

<GoalCard total={earned} goal={weeklyGoal} />

<ScheduleCard />

<ForecastCard rate={rate} />

<TimeValueCard rate={rate} />

<PayComparisonCard rate={rate} />

<PaycheckCard rate={rate} />

<LifetimeCard rate={rate} />

<TaxEstimatorCard rate={rate} />

<StreakCard streak={streak} />

<CoinsCard coins={coins} />

<BestShiftCard best={best} />

<TaxesCard earned={earned} />

<EarningsHeatmap history={history} />

<EarningsChart history={history} />

</Dashboard>

<ShiftButton working={working} toggle={toggleShift} />

</div>

)

}
