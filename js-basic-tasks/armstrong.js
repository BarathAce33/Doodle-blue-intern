const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("Program started...");

rl.question("Enter a number: ", function (num) {
  let digits = num.split("");
  let power = digits.length;
  let sum = 0;

  for (let i = 0; i < digits.length; i++) {
    sum += Math.pow(Number(digits[i]), power);
  }

  if (sum === Number(num)) {
    console.log(num + " is an Armstrong Number");
  } else {
    console.log(num + " is NOT an Armstrong Number");
  }

  rl.close();
});
