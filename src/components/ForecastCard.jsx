export default function ForecastCard({rate}){

const shiftsPerWeek = 5
const hoursPerShift = 8
const taxRate = 0.22

const gross = rate * shiftsPerWeek * hoursPerShift
const taxes = gross * taxRate
const net = gross - taxes

const card={
background:"#0f223f",
padding:"20px",
borderRadius:"12px"
}

return(

<div style={card}>

<h3>📊 Weekly Forecast</h3>

<p>Expected Gross</p>

<h2>${gross.toFixed(2)}</h2>

<p>Estimated Taxes</p>

<p>${taxes.toFixed(2)}</p>

<h3>Take Home</h3>

<h1>${net.toFixed(2)}</h1>

</div>

)

}
