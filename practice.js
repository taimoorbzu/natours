function makeCake(topings, flavour, ...additional) {
  console.log(`Making a ${flavour} cake with ${topings.join(', ')}`)
  console.log(`Also add: ${additional.join(', ')}`)
}

const toppings = ['Blueberry', 'Cream']
const flavour = 'RedVelvet'
makeCake(toppings, flavour, "Extra chocolate", "Extra sugar");


console.log(makeCake.length);