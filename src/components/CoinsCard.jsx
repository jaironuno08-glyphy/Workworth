export default function CoinsCard({coins}){

const card={
background:"#0f223f",
padding:"20px",
borderRadius:"12px"
}

return(

<div style={card}>

<h3>🪙 WorkWorth Coins</h3>

<h2>{coins}</h2>

<p>Earn 1 coin per $1 earned</p>

</div>

)

}
