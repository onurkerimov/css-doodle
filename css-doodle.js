(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

const is = {
  even: (n) => !!(n % 2),
  odd:  (n) => !(n % 2)
};

function nth(x, y, count) {
  return n => n == count;
}

function at(x, y) {
  return (x1, y1) => (x == x1 && y == y1);
}

function row(x, y, count) {
  return n => /^(even|odd)$/.test(n) ? is[n](x - 1) : (n == x)
}

function col(x, y, count) {
  return n => /^(even|odd)$/.test(n) ? is[n](y - 1) : (n == y);
}

function even(x, y, count) {
  return _ => is.even(count - 1);
}

function odd(x, y, count) {
  return _ => is.odd(count - 1);
}

var cond = {
  nth, at, row, col, even, odd
};

function values(obj) {
  if (Array.isArray(obj)) return obj;
  return Object.keys(obj).map(k => obj[k]);
}

function apply_args(fn, ...args) {
  return args.reduce((f, arg) =>
    f.apply(null, values(arg)), fn
  );
}

function join_line(arr) {
  return (arr || []).join('\n');
}

function make_array(arr) {
  return Array.isArray(arr) ? arr : [arr];
}

function minmax(num, min, max) {
  return Math.max(min, Math.min(max, num));
}

function prefix(rule) {
  return `-webkit-${ rule } ${ rule }`;
}

function only_if(cond, value) {
  return cond ? value : '';
}

const store = {};
function memo(prefix, fn) {
  return function(...args) {
    let key = prefix + args.join('-');
    if (store[key]) return store[key];
    return (store[key] = fn.apply(null, args));
  }
}

function random(...items) {
  let args = items.reduce((ret, n) => ret.concat(n), []);
  return args[Math.floor(Math.random() * args.length)];
}

function range(start, stop, step) {
  let count = 0;
  let initial = n => (n > 0 && n < 1) ? .1 : 1;
  let length = arguments.length;
  if (length == 1) [start, stop] = [initial(start), start];
  if (length < 3) step = initial(start);
  let range = [];
  while ((step > 0 && start < stop)
    || (step < 0 && start > stop)) {
    range.push(start);
    start += step;
    if (count++ >= 1000) break;
  }
  return range;
}

function unitify(fn) {
  return function(...args) {
    let unit = get_unit(args[0]);
    if (unit) {
      args = args.map(remove_unit);
      return add_unit(fn, unit).apply(null, args);
    }
    return fn.apply(null, args);
  }
}

function add_unit(fn, unit) {
  return function(...args) {
    args = args.map(remove_unit);
    let result = fn.apply(null, args);
    if (unit) {
      result = result.map(n => n + unit);
    }
    return result;
  }
}

function get_unit(str) {
  if (!str) return '';
  let unit = /(%|cm|fr|rem|em|ex|in|mm|pc|pt|px|vh|vw|vmax|vmin|deg|ms|s)$/;
  let matched = ''.trim.call(str).match(unit);
  return matched ? matched[0] : '';
}

function remove_unit(str) {
  let unit = get_unit(str);
  return unit ? +(str.replace(unit, '')) : str;
}

const { cos, sin, sqrt, pow, PI } = Math;
const DEG = PI / 180;

function polygon(option, fn) {
  if (typeof arguments[0] == 'function') {
    fn = option;
    option = {};
  }

  if (!fn) {
    fn = t => [ cos(t), sin(t) ];
  }

  var split = option.split || 120;
  var scale = option.scale || 1;
  var start = DEG * (option.start || 0);
  var deg = option.deg ? (option.deg * DEG) : (PI / (split / 2));
  var points = [];

  for (var i = 0; i < split; ++i) {
    var t = start + deg * i;
    var [x, y] = fn(t);
    points.push(
      ((x * 50 * scale) + 50 + '% ') +
      ((y * 50 * scale) + 50 + '%')
    );
  }

  return `polygon(${ points.join(',') })`;
}

function rotate(x, y, deg) {
  var rad = DEG * deg;
  return [
    x * cos(rad) - y * sin(rad),
    y * cos(rad) + x * sin(rad)
  ];
}

function circle() {
  return 'circle(49%)';
}

function triangle() {
  return polygon({ split: 3, start: -90 }, t => [
    cos(t) * 1.1,
    sin(t) * 1.1 + .2
  ]);
}

function rhombus() {
  return polygon({ split: 4 });
}

function pentagon() {
  return polygon({ split: 5, start: 54 });
}


function hexagon() {
  return polygon({ split: 6, start: 30 });
}

function heptagon() {
  return polygon({ split: 7, start: -90 });
}

function octagon() {
  return polygon({ split: 8, start: 22.5 });
}

function star() {
  return polygon({ split: 5, start: 54, deg: 144 });
}

function diamond() {
  return 'polygon(50% 5%, 80% 50%, 50% 95%, 20% 50%)';
}

function cross() {
  return `polygon(
    5% 35%,  35% 35%, 35% 5%,  65% 5%,
    65% 35%, 95% 35%, 95% 65%, 65% 65%,
    65% 95%, 35% 95%, 35% 65%, 5% 65%
  )`;
}

function clover(k = 3) {
  k = minmax(k, 3, 5);
  if (k == 4) k = 2;
  return polygon({ split: 240 }, t => {
    var x = cos(k * t) * cos(t);
    var y = cos(k * t) * sin(t);
    if (k == 3) x -= .2;
    if (k == 2) {
      x /= 1.1;
      y /= 1.1;
    }
    return [x, y];
  });
}

function hypocycloid(k = 3) {
  k = minmax(k, 3, 6);
  var m = 1 - k;
  return polygon({ scale: 1 / k  }, t => {
    var x = m * cos(t) + cos(m * (t - PI));
    var y = m * sin(t) + sin(m * (t - PI));
    if (k == 3) {
      x = x * 1.1 - .6;
      y = y * 1.1;
    }
    return [x, y];
  });
}

function astroid() {
  return hypocycloid(4);
}

function infinity() {
  return polygon(t => {
    var a = .7 * sqrt(2) * cos(t);
    var b = (pow(sin(t), 2) + 1);
    return [
      a / b,
      a * sin(t) / b
    ]
  });
}

function heart() {
  return polygon(t => {
    var x = .75 * pow(sin(t), 3);
    var y =
        cos(1 * t) * (13 / 18)
      - cos(2 * t) * (5 / 18)
      - cos(3 * t) / 18
      - cos(4 * t) / 18;
    return rotate(
      x * 1.2,
      (y + .2) * 1.1,
      180
    );
  });
}

function bean() {
  return polygon(t => {
    var [a, b] = [pow(sin(t), 3), pow(cos(t), 3)];
    return rotate(
      (a + b) * cos(t) * 1.3 - .45,
      (a + b) * sin(t) * 1.3 - .45,
      -90
    );
  });
}

function bicorn() {
  return polygon(t => rotate(
    cos(t),
    pow(sin(t), 2) / (2 + sin(t)) - .5,
    180
  ));
}

function pear() {
  return polygon(t => [
    sin(t),
    (1 + sin(t)) * cos(t) / 1.4
  ]);
}

function fish() {
  return polygon(t => [
    cos(t) - pow(sin(t), 2) / sqrt(2),
    sin(2 * t) / 2
  ]);
}

function whale() {
  return polygon({ split: 240 }, t => {
    var r = 3.4 * (pow(sin(t), 2) - .5) * cos(t);
    return rotate(
      cos(t) * r + .75,
      sin(t) * r * 1.2,
      180
    );
  });
}

function bud(n = 3) {
  n = minmax(n, 3, 10);
  return polygon({ split: 240 }, t => [
    ((1 + .2 * cos(n * t)) * cos(t)) * .8,
    ((1 + .2 * cos(n * t)) * sin(t)) * .8
  ]);
}

var shapes = {
  circle, triangle, rhombus, pentagon,
  hexagon, heptagon, octagon, star,
  diamond, cross, clover, hypocycloid,
  astroid, infinity, heart, bean,
  bicorn, pear, fish, whale, bud
};

function index(x, y, count) {
  return _ => count;
}

function row$1(x, y, count) {
  return _ => x;
}

function col$1(x, y, count) {
  return _ => y;
}

function any() {
  return function(...args) {
    return random.apply(null, args);
  }
}

function pick() {
  return any.apply(null, arguments);
}

function rand() {
  return function(...args) {
    return random(
      memo('range', unitify(range)).apply(null, args)
    );
  }
}

function shape(x, y, count) {
  return memo('shape', function(type, ...args) {
    if (type) {
      type = type.trim();
      if (shapes[type]) {
        return shapes[type].apply(null, args);
      }
    }
  });
}

var func = {
  index, row: row$1, col: col$1, any, pick, rand, shape
};

var math = Object.getOwnPropertyNames(Math).reduce((expose, n) => {
  expose[n] = function() {
    return function(...args) {
      if (typeof Math[n] === 'number') return Math[n];
      return Math[n].apply(null, args.map(eval));
    }
  };
  return expose;
}, {});

const reg_size = /[,，\/\s]+\s*/;

var shortcuts = {

  ['size'](value) {
    var [w, h = w] = value.split(reg_size);
    return `width: ${ w }; height: ${ h };`;
  },

  ['min-size'](value) {
    var [w, h = w] = value.split(reg_size);
    return `min-width: ${ w }; min-height: ${ h };`;
  },

  ['max-size'](value) {
    var [w, h = w] = value.split(reg_size);
    return `max-width: ${ w }; max-height: ${ h };`;
  }

};

class Rules {

  constructor(tokens) {
    this.tokens = tokens;
    this.rules = {};
    this.props = {};
    this.keyframes = {};
    this.styles = {
      host: '', cells: '', keyframes: ''
    };
  }

  add_rule(selector, rule) {
    var rules = this.rules[selector];
    if (!rules) {
      rules = this.rules[selector] = [];
    }
    rules.push.apply(rules, make_array(rule));
  }

  pick_func(name) {
    return func[name] || math[name];
  }

  compose_aname(...args) {
    return args.join('-');
  }

  compose_selector(count, psuedo = '') {
    return `.cell:nth-of-type(${ count })${ psuedo }`;
  }

  compose_argument(argument, coords) {
    var result = argument.map(arg => {
      if (arg.type == 'text') {
        return arg.value;
      }
      else if (arg.type == 'func') {
        var fn = this.pick_func(arg.name.substr(1));
        if (fn) {
          var args = arg.arguments.map(n => {
            return this.compose_argument(n, coords);
          });
          return apply_args(fn, coords, args);
        }
      }
    });

    return (result.length > 2)
      ? result.join('')
      : result[0];
  }

  compose_value(value, coords) {
    return value.reduce((result, val) => {
      switch (val.type) {
        case 'text': {
          result += val.value;
          break;
        }
        case 'func': {
          var fn = this.pick_func(val.name.substr(1));
          if (fn) {
            var args = val.arguments.map(arg => {
              return this.compose_argument(arg, coords);
            });
            result += apply_args(fn, coords, args);
          }
        }
      }
      return result;
    }, '');
  }

  compose_rule(token, coords) {
    var prop = token.property;
    var value = this.compose_value(token.value, coords);
    var rule = `${ prop }: ${ value };`;

    if (prop == 'transition') {
      this.props.has_transition = true;
    }

    if (prop == 'clip-path') {
      rule = prefix(rule);
      // fix clip bug
      rule += ';overflow: hidden;';
    }

    if (/^animation(\-name)?$/.test(prop)) {
      this.props.has_animation = true;
      if (coords.count > 1) {
        var { count } = coords;
        switch (prop) {
          case 'animation-name': {
            rule = `${ prop }: ${ this.compose_aname(value, count) };`;
            break;
          }
          case 'animation': {
            var group = (value || '').split(/\s+/);
            group[0] = this.compose_aname(group[0], count);
            rule = `${ prop }: ${ group.join(' ') };`;
          }
        }
      }
    }

    if (shortcuts[prop]) {
      rule = shortcuts[prop](value);
    }

    return rule;
  }

  compose(coords, tokens) {
    (tokens || this.tokens).forEach((token, i) => {
      if (token.skip) return false;
      switch (token.type) {
        case 'rule':
          this.add_rule(
            this.compose_selector(coords.count),
            this.compose_rule(token, coords)
          );
          break;

        case 'psuedo': {
          if (token.selector.startsWith(':doodle')) {
            token.selector =
              token.selector.replace(/^\:+doodle/, ':host');
          }

          var is_host_selector =
            token.selector.startsWith(':host');

          if (is_host_selector) {
            token.skip = true;
          }

          var psuedo = token.styles.map(s =>
            this.compose_rule(s, coords)
          );

          var selector = is_host_selector
            ? token.selector
            : this.compose_selector(coords.count, token.selector);

          this.add_rule(selector, psuedo);
          break;
        }

        case 'cond': {
          var fn = cond[token.name.substr(1)];
          if (fn) {
            var args = token.arguments.map(arg => {
              return this.compose_argument(arg, coords);
            });
            var result = apply_args(fn, coords, args);
            if (result) {
              this.compose(coords, token.styles);
            }
          }
          break;
        }

        case 'keyframes': {
          if (this.keyframes[token.name]) return false;
          this.keyframes[token.name] = () => `
            ${ join_line(token.steps.map(step => `
              ${ step.name } {
                ${ join_line(
                  step.styles.map(s => this.compose_rule(s, coords))
                )}
              }
            `)) }
          `;
        }
      }
    });
  }

  output() {
    Object.keys(this.rules).forEach((selector, i) => {
      var target = selector.startsWith(':host') ? 'host': 'cells';
      this.styles[target] += `
        ${ selector } {
          ${ join_line(this.rules[selector]) }
        }
      `;

      Object.keys(this.keyframes).forEach(name => {
        var aname = this.compose_aname(name, i + 1);
        this.styles.keyframes += `
          ${ only_if(i == 0,
            `@keyframes ${ name } {
              ${ this.keyframes[name]() }
            }`
          )}
          @keyframes ${ aname } {
            ${ this.keyframes[name]() }
          }
        `;
      });
    });

    return {
      props: this.props,
      styles: this.styles
    }
  }
}

function generator(tokens, size) {
  var rules = new Rules(tokens);
  for (var x = 1, count = 0; x <= size.x; ++x) {
    for (var y = 1; y <= size.y; ++y) {
      rules.compose({ x, y, count: ++count});
    }
  }
  return rules.output();
}

const struct = {

  func(name = '') {
    return {
      type: 'func',
      name,
      arguments: []
    };
  },

  argument() {
    return {
      type: 'argument',
      value: []
    };
  },

  text(value = '') {
    return {
      type: 'text',
      value
    };
  },

  comment(value) {
    return {
      type: 'comment',
      value
    }
  },

  psuedo(selector = '') {
    return {
      type: 'psuedo',
      selector,
      styles: []
    };
  },

  cond(name = '') {
    return {
      type: 'cond',
      name,
      styles: [],
      arguments: []
    };
  },

  rule(property = '') {
    return {
      type: 'rule',
      property,
      value: []
    };
  },

  keyframes(name = '') {
    return {
      type: 'keyframes',
      name,
      steps: []
    }
  },

  step(name = '') {
    return {
      type: 'step',
      name,
      styles: []
    }
  }

};

const bracket_pair = {
  '(': ')',
  '[': ']',
  '{': '}'
};

const is$1 = {
  white_space(c) {
    return /[\s\n\t]/.test(c);
  },
  open_bracket(c) {
    return bracket_pair.hasOwnProperty(c);
  },
  close_bracket_of(c) {
    var pair = bracket_pair[c];
    return p => p == pair;
  },
  number(n) {
    return !isNaN(n);
  }
};

function iterator(input) {
  var index = 0, col = 1, line = 1;
  return {
    curr:  (n = 0) => input[index + n],
    end:   ()  => input.length <= index,
    info:  ()  => ({ index, col, line }),
    index: (n) => (n === undefined ? index : index = n),
    next:  ()  => {
      var next = input[index++];
      if (next == '\n') line++, col = 0;
      else col++;
      return next;
    }
  };
}

function throw_error(msg, { col, line }) {
  throw new Error(
    `(at line ${ line }, column ${ col }) ${ msg }`
  );
}

function get_text_value(input) {
  if (input.trim().length) {
    return is$1.number(+input) ? +input : input.trim()
  } else {
    return input;
  }
}

function skip_block(it) {
  var [skipped, c] = [it.curr(), it.curr()];
  var is_close_bracket = is$1.close_bracket_of(c);
  it.next();
  while (!it.end()) {
    if (is_close_bracket(c = it.curr())) {
      skipped += c;
      break;
    }
    else if (is$1.open_bracket(c)) {
      skipped += skip_block(it);
    } else {
      skipped += c;
    }
    it.next();
  }
  return skipped;
}

function read_word(it, reset) {
  var index = it.index();
  var word = '';
  while (!it.end()) {
    var c = it.next();
    if (is$1.white_space(c)) break;
    else word += c;
  }
  if (reset) {
    it.index(index);
  }
  return word;
}

function read_step(it) {
  var c, step = struct.step();
  while (!it.end()) {
    if ((c = it.curr()) == '}') break;
    if (is$1.white_space(c)) {
      it.next();
      continue;
    }
    else if (!step.name.length) {
      step.name = read_selector(it);
    } else {
      step.styles.push(read_rule(it));
      if (it.curr() == '}') break;
    }
    it.next();
  }
  return step;
}

function read_steps(it) {
  const steps = [];
  var c;
  while (!it.end()) {
    if ((c = it.curr()) == '}') break;
    else if (is$1.white_space(c)) {
      it.next();
      continue;
    }
    else {
      steps.push(read_step(it));
    }
    it.next();
  }
  return steps;
}

function read_keyframes(it) {
  var keyframes = struct.keyframes(), c;
  while (!it.end()) {
    if ((c = it.curr()) == '}') break;
    else if (!keyframes.name.length) {
      read_word(it);
      keyframes.name = read_word(it);
      if (keyframes.name == '{') {
        throw_error('missing keyframes name', it.info());
        break;
      }
      continue;
    } else if (c == '{') {
      it.next();
      keyframes.steps = read_steps(it);
      break;
    }
    it.next();
  }
  return keyframes;
}

function read_comments(it, flag = {}) {
  var comment = struct.comment();
  var c = it.curr();
  if (c != '#') it.next();
  it.next();
  while (!it.end()) {
    if ((c = it.curr()) == '*' && it.curr(1) == '/') break;
    else comment.value += c;
    c = it.curr();
    if (flag.inline) {
      if (c == '\n') return comment;
    } else {
      if (c == '*' && it.curr(1) == '/') break;
    }
    comment.value += c;
    it.next();
  }
  it.next(); it.next();
  return comment;
}

function read_property(it) {
  var prop = '', c;
  while (!it.end()) {
    if ((c = it.curr()) == ':') break;
    else if (!/[a-zA-Z\-]/.test(c)) {
      throw_error('Syntax error: Bad property name.', it.info());
    }
    else if (!is$1.white_space(c)) prop += c;
    it.next();
  }
  return prop;
}

function read_quote_block(it, quote) {
  var block = '', c;
  it.next();
  while (!it.end()) {
    if ((c = it.curr()) == quote) {
      if (it.curr(-1) !== '\\') break;
      else block += c;
    }
    else block += c;
    it.next();
  }
  return block;
}

function read_arguments(it) {
  var args = [], group = [], arg = '', c;
  while (!it.end()) {
    if (is$1.open_bracket(c = it.curr())) {
      arg += skip_block(it);
    }
    else if (/['"]/.test(c)) {
      arg += read_quote_block(it, c);
    }
    else if (c == '@') {
      if (!group.length) {
        arg = arg.trimLeft();
      }
      if (arg.length) {
        group.push(struct.text(arg));
        arg = '';
      }
      group.push(read_func(it));
    }
    else if (/[,)]/.test(c)) {
      if (arg.length) {
        if (!group.length) {
          group.push(struct.text(get_text_value(arg)));
        } else {
          arg = arg.trimRight();
          if (arg.length) {
            group.push(struct.text(arg));
          }
        }
      }

      args.push(group.slice());
      [group, arg] = [[], ''];

      if (c == ')') break;
    }
    else {
      arg += c;
    }

    it.next();
  }

  return args;
}

function read_func(it) {
  var func = struct.func(), name = '', c;
  while (!it.end()) {
    if ((c = it.curr()) == ')') break;
    if (c == '(') {
      it.next();
      func.name = name;
      func.arguments = read_arguments(it);
      break;
    }
    else name += c;
    it.next();
  }
  return func;
}

function read_value(it) {
  var text = struct.text(), c;
  const value = [];
  while (!it.end()) {
    if ((c = it.curr()) == '\n') {
      it.next();
      continue;
    }
    else if (/[;}]/.test(c)) {
      if (text.value.length) value.push(text);
      text = struct.text();
      break;
    }
    else if (c == '@') {
      if (text.value.length) value.push(text);
      text = struct.text();
      value.push(read_func(it));
    }
    else if (!is$1.white_space(c) || !is$1.white_space(it.curr(-1))) {
      if (c == ':') {
        throw_error('Syntax error: Bad property name.', it.info());
      }
      text.value += c;
    }
    it.next();
  }

  if (text.value.length) value.push(text);

  if (value.length && value[0].value) {
    value[0].value = value[0].value.trimLeft();
  }

  return value;
}

function read_selector(it) {
  var selector = '', c;
  while (!it.end()) {
    if ((c = it.curr()) == '{') break;
    else if (!is$1.white_space(c)) {
      selector += c;
    }
    it.next();
  }
  return selector;
}

function read_cond_selector(it) {
  var selector = { name: '', arguments: [] }, c;
  while (!it.end()) {
    if ((c = it.curr()) == '(') {
      it.next();
      selector.arguments = read_arguments(it);
    }
    else if (/[){]/.test(c)) break;
    else if (!is$1.white_space(c)) selector.name += c;
    it.next();
  }
  return selector;
}

function read_psuedo(it) {
  var psuedo = struct.psuedo(), c;
  while (!it.end()) {
    if ((c = it.curr())== '}') break;
    if (is$1.white_space(c)) {
      it.next();
      continue;
    }
    else if (!psuedo.selector) {
      psuedo.selector = read_selector(it);
    }
    else {
      psuedo.styles.push(read_rule(it));
      if (it.curr() == '}') break;
    }
    it.next();
  }
  return psuedo;
}

function read_rule(it) {
  var rule = struct.rule(), c;
  while (!it.end()) {
    if ((c = it.curr()) == ';') break;
    else if (!rule.property.length) {
      rule.property = read_property(it);
    }
    else {
      rule.value = read_value(it);
      break;
    }
    it.next();
  }
  return rule;
}

function read_cond(it) {
  var cond = struct.cond(), c;
  while (!it.end()) {
    if ((c = it.curr()) == '}') break;
    else if (!cond.name.length) {
      Object.assign(cond, read_cond_selector(it));
    }
    else if (c == ':') {
      var psuedo = read_psuedo(it);
      if (psuedo.selector) cond.styles.push(psuedo);
    }
    else if (c == '@') {
      cond.styles.push(read_cond(it));
    }
    else if (!is$1.white_space(c)) {
      var rule = read_rule(it);
      if (rule.property) cond.styles.push(rule);
      if (it.curr() == '}') break;
    }
    it.next();
  }
  return cond;
}

function tokenizer(input) {
  const it = iterator(input);
  const tokens = [];
  while (!it.end()) {
    var c = it.curr();
    if (is$1.white_space(c)) {
      it.next();
      continue;
    }
    else if (c == '/' && it.curr(1) == '*') {
      tokens.push(read_comments(it));
    }
    else if (c == '#' || (c == '/' && it.curr(1) == '/')) {
      tokens.push(read_comments(it, { inline: true }));
    }
    else if (c == ':') {
      var psuedo = read_psuedo(it);
      if (psuedo.selector) tokens.push(psuedo);
    }
    else if (c == '@') {
      if (read_word(it, true) === '@keyframes') {
        var keyframes = read_keyframes(it);
        tokens.push(keyframes);
      } else {
        var cond = read_cond(it);
        if (cond.name.length) tokens.push(cond);
      }
    }
    else if (!is$1.white_space(c)) {
      var rule = read_rule(it);
      if (rule.property) tokens.push(rule);
    }
    it.next();
  }
  return tokens;
}

function compile(input, size) {
  return generator(tokenizer(input), size);
}

const MIN = 1;
const MAX = 16;

function parse_size(size) {
  let [x, y] = (size + '')
    .replace(/\s+/g, '')
    .replace(/[,，xX]+/, 'x')
    .split('x')
    .map(Number);

  const ret = {
    x: minmax(x || MIN, 1, MAX),
    y: minmax(y || x || MIN, 1, MAX)
  };

  return Object.assign({}, ret,
    { count: ret.x * ret.y }
  );
}

const basic = `
  :host {
    display: block;
    visibility: visible;
    width: 1em;
    height: 1em;
  }
  .container {
    position: relative;
    width: 100%;
    height: 100%;
    display: grid;
  }
  .cell {
    position: relative;
    line-height: 1;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

class Doodle extends HTMLElement {
  constructor() {
    super();
    this.doodle = this.attachShadow({ mode: 'open' });
  }
  connectedCallback() {
    setTimeout(() => {
      if (!this.innerHTML.trim()) {
        return false;
      }

      let compiled;

      try {
        compiled = compile(
          this.innerHTML,
          this.size = parse_size(this.getAttribute('grid'))
        );
      } catch (e) {
        // clear content before throwing error
        this.innerHTML = '';
        throw new Error(e);
      }

      const { has_transition, has_animation } = compiled.props;

      this.doodle.innerHTML = `
        <style>${ basic }</style>
        <style class="style-keyframes">
          ${ compiled.styles.keyframes }
        </style>
        <style class="style-container">
          ${ this.style_size() }
          ${ compiled.styles.host }
        </style>
        <style class="style-cells">
          ${ (has_transition || has_animation) ? '' : compiled.styles.cells }
        </style>
        <div class="container">
          ${ this.html_cells() }
        </div>
      `;

      if (has_transition || has_animation) {
        setTimeout(() => {
          this.set_style('.style-cells',
            compiled.styles.cells
          );
        }, 50);
      }

    });
  }

  style_size() {
    return `
      .container {
        grid-template-rows: repeat(${ this.size.x }, 1fr);
        grid-template-columns: repeat(${ this.size.y }, 1fr);
      }
    `;
  }

  html_cells() {
    return '<div class="cell"></div>'
      .repeat(this.size.count);
  }

  set_style(selector, styles) {
    const el = this.shadowRoot.querySelector(selector);
    el && (el.styleSheet
      ? (el.styleSheet.cssText = styles )
      : (el.innerHTML = styles));
  }

  update(styles) {
    if (!styles) {
      return false;
    }
    if (!this.size) {
      this.size = parse_size(this.getAttribute('grid'));
    }
    const compiled = compile(styles, this.size);

    this.set_style('.style-keyframes',
      compiled.styles.keyframes
    );
    this.set_style('.style-container',
      this.style_size() + compiled.styles.host
    );
    this.set_style('.style-cells',
      compiled.styles.cells
    );
    this.innerHTML = styles;
  }

  refresh() {
    this.update(this.innerHTML);
  }

  get grid() {
    return Object.assign({}, this.size);
  }

  set grid(grid) {
    this.setAttribute('grid', grid);
    this.connectedCallback();
  }

  static get observedAttributes() {
    return ['grid'];
  }

  attributeChangedCallback(name, old_val, new_val) {
    if (name == 'grid' && old_val) {
      if (old_val !== new_val) {
        this.grid = new_val;
      }
    }
  }
}

customElements.define('css-doodle', Doodle);

})));
