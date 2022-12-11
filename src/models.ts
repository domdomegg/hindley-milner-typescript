// Expressions

export type Expression =
  | Variable
  | Application
  | Abstraction
  | Let

export interface Variable {
  type: 'var';
  x: string;
}

export interface Application {
  type: 'app';
  e1: Expression;
  e2: Expression;
}

export interface Abstraction {
  type: 'abs';
  x: string;
  e: Expression;
}

export interface Let {
  type: 'let';
  x: string;
  e1: Expression;
  e2: Expression;
}

// Types

export type Monotype =
  | TypeVariable
  | TypeAppication

export type Polytype =
  | Monotype
  | TypeQuantifier

export type Context = { [variable: string]: Polytype }

export interface TypeVariable {
  type: 'var';
  a: string;
}

export interface TypeAppication {
  type: 'app';
  C: '->' | 'Int' | 'Bool';
  t: Monotype[];
}

export interface TypeQuantifier {
  type: 'quantifier';
  a: string;
  o: Polytype;
}
