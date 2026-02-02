const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("Program started...");

rl.question("Enter a number: ", function (num) {
  let reversed = num.split("").reverse().join("");
  console.log("Reversed Number:", reversed);
  rl.close();
});
