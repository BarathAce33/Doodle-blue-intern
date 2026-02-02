const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("Program started...");

function flattenArray(arr) {
  let result = [];

  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      result = result.concat(flattenArray(arr[i]));
    } else {
      result.push(arr[i]);
    }
  }

  return result;
}

rl.question("Enter a nested array: ", function (input) {
  let arr = JSON.parse(input);
  let flattened = flattenArray(arr);
  console.log("Flattened Array:", flattened);
  rl.close();
});
