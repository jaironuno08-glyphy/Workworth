export default function TaxEstimatorCard({rate}){

const hoursPerWeek = 40
const weeksPerYear = 52

const yearlyIncome = rate * hoursPerWeek * weeksPerYear

// rough tax estimate
const federalRate = 0.12
const stateRate = 0.05

const federalTax = yearlyIncome * federalRate
const stateTax = yearlyIncome * stateRate

const totalTax = federalTax + stateTax

// assume some withholding buffer
const refund = totalTax * 0.15

const card={
background:"#0f223f",
padding:"20px",
borderRadius:"12px"
}

return(

<div style={card}>

<h3>🧾 Tax Estimator</h3>

<p>Estimated Yearly Income</p>
<h2>${yearlyIncome.toFixed(0)}</h2>

<p>Federal Tax</p>
<p>${federalTax.toFixed(0)}</p>

<p>State Tax</p>
<p>${stateTax.toFixed(0)}</p>

<h3>Total Estimated Tax</h3>
<p>${totalTax.toFixed(0)}</p>

<h3>Possible Refund</h3>
<h2>${refund.toFixed(0)}</h2>

</div>

)

}
