export default function PaycheckCard({rate}){

const hoursPerWeek = 40
const taxRate = 0.22

const gross = rate * hoursPerWeek
const taxes = gross * taxRate
const net = gross - taxes

const card={
background:"#0f223f",
padding:"20px",
borderRadius:"12px"
}

return(

<div style={card}>

<h3>💵 Paycheck Predictor</h3>

<p>Weekly Gross: ${gross.toFixed(2)}</p>

<p>Estimated Taxes: ${taxes.toFixed(2)}</p>

<h2>Take Home: ${net.toFixed(2)}</h2>

</div>

)

}
