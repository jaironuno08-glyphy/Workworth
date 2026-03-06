import { useState } from "react"

export function useWorkStore(){

const [earned,setEarned] = useState(0)
const [working,setWorking] = useState(false)
const [history,setHistory] = useState([])
const [streak,setStreak] = useState(0)
const [coins,setCoins] = useState(0)
const [best,setBest] = useState(0)

function endShift(){

setHistory(h=>[
...h,
{earnings:earned}
])

setCoins(c=>c+Math.floor(earned))

setStreak(s=>s+1)

setBest(b=> earned>b ? earned : b)

setEarned(0)

}

return{

earned,
setEarned,
working,
setWorking,
history,
streak,
coins,
best,
endShift

}

}
