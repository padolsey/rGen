## rGen: regex fulfillment

Generate strings to fulfill basic regular expressions using rGen.

**In other words: rGen produces random strings that comply with any given regular expression.**

### Examples:

```js
rGen(/hello/) // => "hello"
rGen(/\d\w\d/) // => "0f4"
rGen(/[a-z]+/) // => "cykifsqhioquvdquw"

// Note: it won't progress through possible strings
// It'll just give you random generations, but,
// ...eventually, something like:
rGen(/c[ao][tr]/)
// would produce:
//  => "cat"
//  => "car"
//  => "cot"
//  => "cor"
```

### Currently supporting:

 * Character classes plus ranges (e.g. `[a-z_]`)
 * Negated character classes
 * Shorthand character classes (supported: `\d\D\s\S\W\w`)
 * Infinite (theoretically) nested groups
 * Quantifiers (all quantifiers are treated as lazy, even if you add the `?`)
 * `+` and `*` and `{n,}` have a hard-coded upper limit of 50 (TODO: make it configurable)

### Possible future additions (???)

 * `\b` and `\B`
 * Lookarounds
 * Regex flags like `i` and `m`
 * ???

### Other TODOs

 * Use headless PhantomJS w/ grunt to test in node
 * Add it to npm?