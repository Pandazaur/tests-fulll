import { describe, it } from "node:test";
import assert from "node:assert";
import { fizzBuzz } from "./fizzbuzz.js";
// import { fizzBuzz_alt as fizzBuzz } from "./fizzbuzz.js";

describe('Test FuzzBuzz', () => {
    it('should show "Fizz" if numbers can be divided by 3', () => {
        assert.strictEqual(fizzBuzz(3), "Fizz")
        assert.strictEqual(fizzBuzz(6), "Fizz")
        assert.strictEqual(fizzBuzz(9), "Fizz")
    })

    it('should show "Buzz" if numbers can be divided by 5', () => {
        assert.strictEqual(fizzBuzz(5), "Buzz")
        assert.strictEqual(fizzBuzz(10), "Buzz")
        assert.strictEqual(fizzBuzz(20), "Buzz")
    })

    it('should show "FizzBuzz" if numbers can be divided by 3 and 5', () => {
        assert.strictEqual(fizzBuzz(30), "FizzBuzz")
        assert.strictEqual(fizzBuzz(60), "FizzBuzz")
        assert.strictEqual(fizzBuzz(90), "FizzBuzz")
    })


    it('should show the number" if numbers CANNOT be divided by 3 or 5', () => {
        assert.strictEqual(fizzBuzz(17), 17)
        assert.strictEqual(fizzBuzz(19), 19)
        assert.strictEqual(fizzBuzz(29), 29)
    })

    it('should show the correct suit of 36 first numbers', () => {
        const occurences = []

        for (let i = 1; i <= 36; i++) {
            occurences.push(fizzBuzz(i))
        }

        assert.strictEqual(
            occurences.join(', '),
            "1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz, 16, 17, Fizz, 19, Buzz, Fizz, 22, 23, Fizz, Buzz, 26, Fizz, 28, 29, FizzBuzz, 31, 32, Fizz, 34, Buzz, Fizz"
        )
    })
});