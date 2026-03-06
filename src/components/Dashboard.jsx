import { useState } from "react"

export default function Dashboard({children}){

const [order,setOrder] = useState(
children.map((_,i)=>i)
)

function swap(a,b){

const newOrder=[...order]

const temp=newOrder[a]
newOrder[a]=newOrder[b]
newOrder[b]=temp

setOrder(newOrder)

}

const grid={
display:"grid",
gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",
gap:"20px"
}

return(

<div style={grid}>

{order.map((i,index)=>(

<div
key={index}
draggable
onDragStart={e=>{

e.dataTransfer.setData("card",index)

}}
onDragOver={e=>e.preventDefault()}
onDrop={e=>{

const from = e.dataTransfer.getData("card")

swap(from,index)

}}
>

{children[i]}

</div>

))}

</div>

)

}
