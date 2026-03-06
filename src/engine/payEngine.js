export function perSecond(rate){
  return rate / 3600;
}

export function calculateTaxes(amount, taxRate){
  return amount * taxRate;
}

export function overtimeRate(rate){
  return rate * 1.5;
}

export function goalProgress(total, goal){
  return Math.min((total/goal)*100,100);
}
