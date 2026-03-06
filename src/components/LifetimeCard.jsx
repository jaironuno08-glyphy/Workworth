export default function LifetimeCard({rate}){

const years = 40
const weeksPerYear = 52
const hoursPerWeek = 40

const yearly = rate * hoursPerWeek * weeksPerYear
const lifetime = yearly * years

const card={
background:"#0f223f",
padding:"20px",
borderRadius:"12px"
}

return(

<div style={card}>

<h3>📈 Lifetime Earnings</h3>

<p>Estimated Yearly Income</p>

<h2>${yearly.toFixed(0)}</h2>

<p>Projected Career Earnings</p>

<h1>${lifetime.toFixed(0)}</h1>

</div>

)

}
