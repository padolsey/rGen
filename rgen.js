/**
 * rGen will generate a string to fulfill a regular expression
 * It'll do so randomly. So passing /[a-z]/ might give you 'k'
 * today but 'w' tomorrow.
 * It supports a limited syntax, which excludes lookarounds and
 * some other pesky things (will specify in readme ASAP)
 */

var rGen = (function() {

  var ALPHA = 'abcdefghijklmnopqrstuvwxyz',
      ALPHA_UPPER = ALPHA.toUpperCase(),
      NUMERIC = '0123456789',
      PUNCTUATION = '-!@£$%^&*()[]{}\'"/?.>,<;:\\|~`€#',
      UNDERSCORE = '_',
      WHITESPACE = '\x20\t\n\r\f\v\xa0\u2028\u2029\u1680\u180e\u2000\u200a\u202f\u205f\u3000';

  var SHORTHAND_CC = {
    '\\S': ALPHA + ALPHA_UPPER + NUMERIC + PUNCTUATION + UNDERSCORE,
    '\\s': WHITESPACE,
    '\\W': NUMERIC + PUNCTUATION + UNDERSCORE,
    '\\w': ALPHA + ALPHA_UPPER + NUMERIC + '_',
    '\\d': NUMERIC,
    '\\D': ALPHA + ALPHA_UPPER + PUNCTUATION + UNDERSCORE + WHITESPACE,
    '\\t': '\t',
    '\\n': '\n',
    '\\r': '\r'
  };

  /**
   * A group, as in, a regular expression Group,
   * A container of "sacks"
   * A sack is either a string or a another Group instance
   */
  function Group(parent) {
    this.sacks = [];
    this.parent = parent;
    this.or = false;
  }

  Group.prototype = {
    /** 
     * Repeat previous sack n times
     * Used for `+`, `*` and `{n,n}`
     */
    prevRepeat: function(n) {
      var prev = this.sacks.pop(),
          newGroup = new Group(this);
      this.sacks.push(newGroup);
      for (var i = 0; i < n; ++i) {
        newGroup.sacks.push(prev);
      }
    },
    /** 
     * Add group and return it
     */
    addGroup: function() {
      var g = new Group(this);
      this.sacks.push(g);
      return g;
    }
  };

  function rGen(r) {

    r = r.source;

    var esc = false;
    var root = new Group(null);
    var group = root;
    var cls = null;
    var code = '';
    var sack;
    var m;

    for (var i = 0, l = r.length; i < l; ++i) {

      var prev = r.charAt(i-1) || '';
      var cur = r.charAt(i);
      var next = r.charAt(i+1) || '';

      if (esc) {
        //console.log('AM ESCAPED', cur);
        group.sacks.push(cur);
        esc = false;
        continue;
      }

      if (cls) {

        if (cur == ']') {
          cls = null;
          continue;
        }

        var clsInner = r.slice(i).match(/^(\^)?((?:\\]|[^\]])+?)(?=\])/); // everything until closing ]

        if (!clsInner) {
          throw 'Empty CharacterClass @ ' + i;
        }
        
        i += clsInner[0].length;

        if (clsInner[1]) {
          clsInner = (
            ALPHA + ALPHA_UPPER +
            NUMERIC + PUNCTUATION + UNDERSCORE
          ).replace(RegExp('[' + clsInner[2] + ']', 'g'), '');
        } else {
          clsInner = clsInner[2];
        }

        m = clsInner.match(/[a-z0-9]-[a-z0-9]|\\.|./gi);

        // For a character class we use a Group (OR = true)
        group = group.addGroup();
        group.or = true;
        m.forEach(function(expr) {
          group.sacks.push(genSingleExpression(expr, true));
        });
        group = group.parent;

        cls = null;

        continue;

      } else {

        switch (cur) {
          case '\\' :
            if (/[dDwWsStnr]/.test(next)) {
              sack = genSingleExpression(cur + next);
              group.sacks.push(sack);
              i += 1;
            } else {
              esc = true;
            }
            break;
          case '|' :
            group = group.addGroup();
            group.or = true;
            group.sacks.push(group.parent.sacks.pop());
            break;
          case '(' : 
            group = group.addGroup();
            // No difference between capturing/non-capturing groups:
            // Just keep going:
            if (r.slice(i + 1, i + 3) === '?:') {
              i += 2;
            }
            break;
          case ')' :
            group = group.parent;
            break; 
          case '[' : prevSacks = []; cls = []; break;
          case '{' :
            // Notice: we ignore greediness! (}?)
            if (m = r.slice(i+1).match(/^(\d+)(?:(,)(\d+))?}\??/)) {
              m[1] = +m[1];
              m[3] = +m[3];
              group.prevRepeat(
                m[2] ?
                  0|Math.random() * ((m[3]-m[1])||50) + m[1] // {n,n}
                  : m[1] // {n}
              );
              i += m[0].length;
            }
            break;
          case '?' :
            if (Math.random() > .5) {
              group.sacks.pop();
              //code = code.slice(0, -1);
            }
            break;
          case '+' :
            group.prevRepeat(0|Math.random() * 50 + 1);
            if (next == '?') {
              i += 1; // ignore greediness
            }
            break;
          case '*' :
            group.prevRepeat(0|Math.random() * 50);
            if (next == '?') {
              i += 1; // ignore greediness
            }
            break;
          case '^' :
          case '$' :
            break;
          default:
            group.sacks.push(cur);
        } 
      }

    }

    return selectFromSack(root);

  }

  /**
   * Generates for a single expression
   * A range (a-x), a shorthand CC (\d) or a literal char
   */
  function genSingleExpression(expr, isInCharacterClass) {
    var ret;
    if (isInCharacterClass && /[a-z0-9]-[a-z0-9]/i.test(expr)) {
      // a-z or 0-9
      var a = expr.charAt(0),
          b = expr.charAt(2),
          iA = ALPHA.indexOf(a.toLowerCase()),
          iB = ALPHA.indexOf(b.toLowerCase()),
          isUpperCase = a.toUpperCase() === a;
      if (iA > -1 && iB > -1) {
        ret = ALPHA.substring(iA, iB + 1);
        if (isUpperCase) return ret.toUpperCase();
        return ret;
      } else if(!isNaN(a) && !(isNaN(b)) && +a < +b) {
        return arrayN(a, b).join('');
      }
    } else if (/^\\[dDwWsStnr]$/i.test(expr)) {
      // Shorthand Character Classes
      return SHORTHAND_CC[expr];
    } else if (/^\\/.test(expr)) {
      // Escaped character
      return expr.charAt(1);
    } else {
      // Literal expression (e.g. /hello/)
      return expr;
    }
  }

  /**
   * Picks a single character from a sack
   * or a string of characters from a groups of sacks.
   */
  function selectFromSack(str, nTimes) {
    if (nTimes > 1) {
      var ret = '';
      for (var i = 0; i < nTimes; ++i) {
        ret += selectFromSack(str);
      }
      return ret;
    }
    if (str instanceof Group) {
      if (str.or) {
        return selectFromSack(str.sacks[0 | Math.random() * str.sacks.length]);
      } else {
        return str.sacks.map(function(sack) {
          return selectFromSack(sack);
        }).join('');
      }
    }
    return str.charAt(0 | Math.random() * str.length);
  }

  /**
   * Creates an array [lower..upper]
   * e.g. arrayN(3, 5) => [3,4,5]
   */
  function arrayN(lower, upper) {
    for(var a = [], i = lower; i <= upper; ++i) a.push(i);
    return a;
  }

  return rGen;

}());

if (typeof module != 'undefined' && module && module.exports) {
  module.exports = rGen;
}
