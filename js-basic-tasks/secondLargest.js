const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("Program started...");

rl.question("Enter numbers separated by space: ", function (input) {
  let arr = input.split(" ").map(Number);

  arr.sort((a, b) => b - a);

  console.log("Second Largest Number:", arr[1]);
  rl.close();
});
