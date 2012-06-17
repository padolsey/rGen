## rGen: regex fulfillment

Generate strings to fulfill basic regular expressions using rGen.

### Currently supporting:

 * Character classes plus ranges (e.g. `[a-z_]`)
 * Negated character classes
 * Shorthand character classes (supported: `\d\D\s\S\W\w`)
 * Infinite (theoretically) nested groups
 * Quantifiers (all quantifiers are treated as lazy, even if you add the `?`)

### Possible future additions (???)

 * `\b` and `\B`
 * Lookarounds
 * Regex flags like `i` and `m`
 * ???

### Other TODOs

 * Use headless PhantomJS w/ grunt to test in node
 * Make it an NPM module!!