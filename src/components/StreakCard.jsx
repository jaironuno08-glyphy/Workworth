export default function StreakCard({streak}){

const card={
background:"#0f223f",
padding:"20px",
borderRadius:"12px"
}

return(

<div style={card}>

<h3>🔥 Work Streak</h3>

<h2>{streak} days</h2>

<p>Keep working to maintain your streak</p>

</div>

)

}
