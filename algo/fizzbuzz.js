export function fizzBuzz(number) {
    if (number % 3 === 0 && number % 5 === 0) {
        return "FizzBuzz"
    }

    if (number % 3 === 0) {
        return "Fizz"
    }

    if (number % 5 === 0) {
        return "Buzz"
    }

    return number
}

/**
 * Version alternative fonctionnelle également.
 * Je préfère celle au-dessus, mais celle-ci est également testable dans fizzbuzz.test.js
 */
export function fizzBuzz_alt(number) {
    let text = ''

    if (number % 3 === 0) {
        text += "Fizz"
    }

    if (number % 5 === 0) {
        text += "Buzz"
    }

    return text || number
}

