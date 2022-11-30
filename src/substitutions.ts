import { Context, Monotype, Polytype } from './types';

export type Substitution = {
  type: 'substitution';
  (s: Substitution): Substitution;
  (t: Monotype): Monotype;
  (t: Polytype): Polytype;
  (c: Context): Context;
  raw: { [typeVariable: string]: Monotype };
}

export const makeSubstitution = (raw: Substitution['raw']): Substitution => {
  const fn = ((other: Monotype | Polytype | Context | Substitution): Monotype | Polytype | Context | Substitution => {
    if (other.type === 'substitution') return combine(fn, other);
    return apply(fn, other);
  }) as Substitution;
  fn.type = 'substitution';
  fn.raw = raw;

  return fn;
};

/** Applies a susbstitution to a type or context */
function apply<T extends Monotype | Polytype | Context>(substitution: Substitution, type: T): T;
function apply(s: Substitution, type: Monotype | Polytype | Context): Monotype | Polytype | Context {
  if (isContext(type)) {
    return Object.fromEntries(Object.entries(type).map(([k, v]) => [k, s(v)]));
  }

  const cases: { [K in Polytype['type']]: (e: Polytype & { type: K }) => Polytype } = {
    var: ({ a }) => (a in s.raw ? s.raw[a] : { type: 'var', a }),
    app: ({ C, t }) => ({ type: 'app', C, t: t.map((t) => s(t)) }),
    quantifier: ({ a, o }) => ({ type: 'quantifier', a, o: s(o) }),
  };

  return cases[type.type](type as any);
}

/** Combines substitutions. Applies rightmost substitution first, e.g. apply(combine(a, b), e) == apply(a, apply(b, e)) */
function combine(...substitutions: Substitution[]): Substitution {
  if (substitutions.length === 0) return id;
  if (substitutions.length === 1) return substitutions[0];
  if (substitutions.length > 2) return combine(combine(...substitutions.slice(substitutions.length - 1)), substitutions[substitutions.length - 1]);

  const [a, b] = substitutions;
  return makeSubstitution(Object.fromEntries([
    ...Object.entries(a.raw),
    ...Object.entries(b.raw).map(([k, v]) => [k, apply(a, v)]),
  ]));
}

export const id: Substitution = makeSubstitution({});

const isContext = (type: Monotype | Polytype | Context): type is Context => typeof type.type !== 'string';
