const INGREDIENT_REGEX = /^\d+[\/\-\d ]* /gm;
const AMOUNT_REGEX = /(\d*[\/ \-\d]*\d+)/gm;

// goes line by line down the recipe and splits anything that looks like an ingredient item
function splitRecipe(recipe, splitBy) {
  const lines = recipe.split("\n");

  const newRecipe = [];
  lines.forEach((line) => {
    const isMatch = line.match(INGREDIENT_REGEX);
    if (isMatch && isMatch.length > 0) {
      newRecipe.push(splitIngredient(line, splitBy));
    } else {
      newRecipe.push(line);
    }
  });

  return newRecipe.join("\n");
}

// absolutely most basic check if it's a fraction-y string
function isFraction(number) {
  return number.indexOf("/") > -1;
}

// converts a fraction string to a decimal for math reasons
// e.g. 1-1/4 -> 1.25
function sanitizeNumber(string) {
  if (!isFraction(string)) return parseInt(string, 10);

  let str = [];
  // for formats like "2 1/2"
  if (string.indexOf(" ") > -1) {
    str = string.split(" ");
    // for formats like "2-1/2"
  } else if (string.indexOf("-") > -1) {
    str = string.split("-");
  } else {
    // otherwise consider it a whole number
    str = [0, string];
  }

  const int = str[0];
  const frac = str[1];
  const fraction = frac.split("/");
  const value = parseInt(fraction[0], 10) / parseInt(fraction[1], 10);

  return parseInt(int, 10) + value;
}

// greatest common denominator
function gcd(a, b) {
  if (b < 0.0000001) return a; // Since there is a limited precision we need to limit the value.

  return gcd(b, Math.floor(a % b)); // Discard any fractions due to limitations in precision.
}

// convert strings like 1.25 to 1-1/4
function convertToStringifiedFractionFormat(amount) {
  const fraction = amount % 1;
  // if theres no remainder, there's no fraction to parse
  if (fraction === 0) return amount;

  const full = amount - fraction;

  const len = fraction.toString().length - 2;

  let denominator = Math.pow(10, len);
  let numerator = fraction * denominator;
  const divisor = gcd(numerator, denominator); // Should be 5

  numerator /= divisor; // Should be 687
  denominator /= divisor; // Should be 2000

  const newFraction = `${numerator}/${denominator}`;
  const amountString = full ? `${full}-${newFraction}` : newFraction;
  return amountString;
}

// splits an ingredient sentence by splitBy
// e.g. 1 cup (8 tablespoons) of butter split by 0.5x
// becomes 1/2 cup (4 tablespoons) of butter
function splitIngredient(ingredient, splitBy) {
  const amounts = ingredient.match(AMOUNT_REGEX);
  console.log(amounts);

  console.log(ingredient);
  let result = ingredient;
  amounts.forEach((a) => {
    if (!a) return;
    const amount = a.trim();
    const sanitizedAmount = sanitizeNumber(amount);
    console.log(a);
    console.log(amount, sanitizedAmount);

    if (!sanitizedAmount) return;
    const newAmount = sanitizedAmount * splitBy;
    const stringAmount = convertToStringifiedFractionFormat(newAmount);

    console.log(newAmount, stringAmount);
    result = result.replaceAll(a, stringAmount);
    console.log(result);
  });

  return result;
}

// what happens when you click button
function onSubmit(e) {
  e.preventDefault();

  const recipe = document.getElementById("recipe");
  const splitBy = document.querySelector('input[name="splitby"]:checked').value;

  const newRecipe = splitRecipe(recipe.value, splitBy);

  document.getElementById("result-contents").innerText = newRecipe;
}

function init() {
  document.getElementById("recipe-form").onsubmit = onSubmit;
}

window.onload = init;
