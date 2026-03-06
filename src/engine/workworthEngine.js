export function calculatePerSecond(rate){
  return rate / 3600
}

export function calculateTaxes(amount,taxRate){
  return amount * taxRate
}

export function calculateGoalProgress(total,goal){
  return Math.min((total/goal)*100,100)
}

export function updateBestShift(earned,best){
  return earned > best ? earned : best
}

export function addHistory(history,earned){
  return [...history,{earnings:earned}]
}
