import { C, F, GenLex, Streams, SingleParser, Tuple } from '@masala/parser';
import { Abstraction, Expression, Let, Variable } from './models';

const genlex = new GenLex();
const identifier = genlex.tokenize(C.charIn('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*+-/%<>^:_|&!\'').rep().map((t) => t.join()), 'identifier');
const letTok = genlex.tokenize(C.string('let '), 'let');
const inTok = genlex.tokenize(C.string('in '), 'in');
const backslash = genlex.tokenize(C.char('\\'), 'backslash');
const arrow = genlex.tokenize(C.string('->'), 'arrow');
const equal = genlex.tokenize(C.char('='), 'equal');
const lparen = genlex.tokenize(C.char('('), 'lparen');
const rparen = genlex.tokenize(C.char(')'), 'rparen');

/* Parser */

const expression = (): SingleParser<Expression> => F.try(VAR())
  .or(F.try(ABS()))
  .or(F.try(LET()))
  .or(F.try(PAR()))
  .rep()
  .array()
  .map(buildIntoApp);

/* Construct-specific parsers */
const VAR = (): SingleParser<Variable> => identifier.map((x) => ({ type: 'var', x }));

const ABS = (): SingleParser<Abstraction> => backslash.drop()
  .then(identifier)
  .then(arrow.drop())
  .then(F.lazy(expression))
  .map((tuple: Tuple<any>) => ({ type: 'abs', x: tuple.at(0), e: tuple.at(1) }));

const LET = (): SingleParser<Let> => letTok.drop()
  .then(identifier)
  .then(equal.drop())
  .then(F.lazy(expression))
  .then(inTok.drop())
  .then(F.lazy(expression))
  .map((tuple: Tuple<any>) => ({ type: 'let', x: tuple.at(0), e1: tuple.at(1), e2: tuple.at(2) }));

// not technically part of lambda calculus syntax, but to resolve ambiguity we can add parentheses
const PAR = (): SingleParser<Expression> => lparen.drop()
  .then(F.lazy(expression))
  .then(rparen.drop())
  .single();

// Given a list of expressions, return left-nested function applications e.g. [a, b, c, d] -> (((a b) c) d)
const buildIntoApp = (v: Expression[]) => v.reduce((prev, cur) => ({ type: 'app', e1: prev, e2: cur }));

const parser: SingleParser<Expression> = genlex.use(expression().then(F.eos().drop()).single());

export const parse = (code: string): Expression => {
  const res = parser.parse(Streams.ofString(code));
  if (res.isAccepted()) {
    return res.value;
  }
  throw new Error('Failed to parse!');
};
