import {
LineChart,
Line,
XAxis,
YAxis,
Tooltip,
ResponsiveContainer,
CartesianGrid,
Area
} from "recharts"

export default function EarningsChart({history}){

const card={
background:"#0f223f",
padding:"20px",
borderRadius:"12px"
}

const chartData = history.map((h,i)=>({
shift:i+1,
earnings:Number(h.earnings.toFixed(2))
}))

return(

<div style={card}>

<h3>Earnings Chart</h3>

<div style={{width:"100%",height:"220px"}}>

<ResponsiveContainer>

<LineChart data={chartData}>

<defs>

<linearGradient id="earnings" x1="0" y1="0" x2="0" y2="1">

<stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
<stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>

</linearGradient>

</defs>

<CartesianGrid stroke="#1f3b64"/>

<XAxis dataKey="shift"/>

<YAxis/>

<Tooltip/>

<Area
type="monotone"
dataKey="earnings"
stroke="none"
fill="url(#earnings)"
/>

<Line
type="monotone"
dataKey="earnings"
stroke="#22c55e"
strokeWidth={4}
dot={false}
isAnimationActive={true}
/>

</LineChart>

</ResponsiveContainer>

</div>

</div>

)

}
