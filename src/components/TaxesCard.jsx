export default function TaxesCard({earned}){

const taxRate = 0.22
const taxes = earned * taxRate

const breakdown = {
social: taxes * 0.24,
medicare: taxes * 0.15,
defense: taxes * 0.16,
health: taxes * 0.14,
education: taxes * 0.10,
infrastructure: taxes * 0.21
}

const card={
background:"#0f223f",
padding:"20px",
borderRadius:"12px"
}

return(

<div style={card}>

<h3>💰 Where Your Taxes Go</h3>

<p>Social Security: ${breakdown.social.toFixed(2)}</p>
<p>Medicare: ${breakdown.medicare.toFixed(2)}</p>
<p>Defense: ${breakdown.defense.toFixed(2)}</p>
<p>Healthcare: ${breakdown.health.toFixed(2)}</p>
<p>Education: ${breakdown.education.toFixed(2)}</p>
<p>Infrastructure: ${breakdown.infrastructure.toFixed(2)}</p>

</div>

)

}
