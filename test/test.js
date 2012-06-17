
// First we test strings generated from regular expressions
// against the initial regular expressions. This is the
// most direct way to test that a generated string does
// in-fact fulfill its source-regular-expression.

var tests = [
	/^(a-z)$/,
	/^([a-z])$/,
	/^\n\t$/,
	/^[^abc]d$/,
	/^[^a-cv-z]d$/,
	/^([a-z]\d[$]{5})$/,
	/^(01234)$/,
	/^(a|bb|cc(c|d))$/,
	/^(\w\d\w\d\S\s\D)$/,
	/^([\w]{2,5})$/,
	/^(\\a\\b)$/,
	/^(a+?b+?c)$/,
	/^([a-z0-9]-[a-z0-9])$/i,
	/^(a|b|c|d)$/,
	/^(?:(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,9}))$/,
	/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/,
	/((a)|(\d{1,3}\.){3}\d{1,3})$/i,
	/^(((\.)+[a-z]{2,6})|(\d{1,3}\.){3}\d{1,3}(\:\d{1,5})?)$/i,
	/^[a-z0-9]{0,62}$/i,
	/^([\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+\.)*[\w\!\#$\%\&\'\*\+\-\/\=\?\^\`{\|\}\~]+@((((([a-z0-9]{1}[a-z0-9\-]{0,62}[a-z0-9]{1})|[a-z])\.)+[a-z]{2,6})|(\d{1,3}\.){3}\d{1,3}(\:\d{1,5})?)$/i
];

tests.forEach(function(regex) {
	test(regex, function() {
		for (var l = 10; l--;) {
			// Run 10 times to be sure
			var str = rGen(regex);
			ok(regex.test(str), str + ' passes ' + regex);
		}
	});
});

throw 2;

// ==== ABSOLUTE/FIXED TESTS ====

// Force e.g. [a-z] -> a, and [0-9] -> 0 (random is ALWAYS zero)
// (Set below to `Math.random`)
var myMathRandom = function() {return 0;};

var absoluteTests = {
	'a-b-c': 'a-b-c',
	'\\d': '0',
	'\\w': 'a',
	'(?:\\w)': 'a',
	'[a-z0-9]': 'a',
	'[0-9a-z]': '0',
	'(a)(hello)(b(c[0-9]))': 'ahellobc0',
	'\\D\\S': 'aa',
		// `?` will always make item PRESENT (as per Math.random === 0)
		'sss?': 'sss',
		'(a(b(c([0-9]?))))': 'abc0',
		'(?:a(?:b(?:c(?:[0-9]?))))': 'abc0',
	'\\[': '[',
	'\\\\': '\\'
};

for (var regex in absoluteTests) {
	var result = absoluteTests[regex];
	regex = RegExp('^(?:' + regex + ')$');
	(function(regex, expected) {
		test('Fixed::' + regex, function() {
			// make sure we've changed Math.random to always returns ZERO!!!
			if (Math.random !== myMathRandom) {
				Math.random = myMathRandom;
			}
			var str = rGen(regex);
			ok(expected === str, str + ' === ' + expected);
		});
	}(regex, result));
}