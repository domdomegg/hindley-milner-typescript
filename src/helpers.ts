import { Context, Monotype, Polytype, TypeVariable } from './models';
import { id, makeSubstitution, Substitution } from './substitutions';

export const instantiate = (type: Polytype, mappings: Map<string, TypeVariable> = new Map()): Monotype => {
  const cases: { [K in Polytype['type']]: (e: Polytype & { type: K }) => Monotype } = {
    var: ({ a }) => mappings.get(a) ?? ({ type: 'var', a }),
    app: ({ C, t }) => ({ type: 'app', C, t: t.map((t) => instantiate(t, mappings)) }),
    quantifier: ({ a, o }) => {
      mappings.set(a, newTypeVar());
      return instantiate(o, mappings);
    },
  };

  return cases[type.type](type as any);
};

let currentTypeVar = 0;
export const newTypeVar = (): TypeVariable => ({ type: 'var', a: `t${currentTypeVar++}` });

export const unify = (type1: Monotype, type2: Monotype): Substitution => {
  if (type1.type === 'var') {
    if (type2.type === 'var' && type1.a === type2.a) {
      return id;
    }

    if (contains(type2, type1)) {
      throw new Error(`Occurs check failed. \`${type1.toString()}\` occurs in \`${type2.toString()}\` so unifying them would create an infinite type.`);
    }
    return makeSubstitution({ [type1.a]: type2 });
  }

  if (type2.type === 'var') {
    return unify(type2, type1);
  }

  if (type1.type === 'app' && type2.type === 'app') {
    if (type1.C !== type2.C) {
      throw new Error(`Could not unify types \`${type1.toString()}\` and \`${type2.toString()}\` with different constructors \`${type1.C}\` and \`${type2.C}\``);
    }

    if (type1.t.length !== type2.t.length) {
      throw new Error(`Could not unify types \`${type1.toString()}\` and \`${type2.toString()}\` with different argument list lengths \`${type1.t.length}\` and \`${type2.t.length}\``);
    }

    let sub: Substitution = id;
    for (let i = 0; i < type1.t.length; i++) {
      sub = sub(unify(sub(type1.t[i]), sub(type2.t[i])));
    }
    return sub;
  }

  // Should be unreachable...
  throw new Error('Internal error, this should never happen');
};

/** @returns whether a type contains a type variable */
function contains(type: Monotype | Polytype, other: TypeVariable): boolean {
  const cases: { [K in Polytype['type']]: (e: Polytype & { type: K }) => boolean } = {
    var: ({ a }) => a === other.a,
    app: ({ t }) => t.some((t) => contains(t, other)),
    quantifier: ({ a, o }) => contains(o, other) && a !== other.a,
  };

  return cases[type.type](type as any);
}

/** Fully generalises a monotype type, for-all qualifying any free type variables not free in the context */
export function generalise(ctx: Context, type: Monotype): Polytype {
  const quantifiers = diff(freeVars(type), freeVars(ctx));
  let t: Polytype = type;
  quantifiers.forEach((q) => {
    t = { type: 'quantifier', a: q, o: type };
  });
  return t;
}

/** Returns a list of free type variable names in a given type or context */
function freeVars(type: Polytype | Context): string[] {
  if (isContext(type)) {
    return Object.values(type).map(freeVars).reduce((acc, cur) => [...acc, ...cur], []);
  }

  const cases: { [K in Polytype['type']]: (e: Polytype & { type: K }) => string[] } = {
    var: ({ a }) => [a],
    app: ({ t }) => t.flatMap(freeVars),
    quantifier: ({ a, o }) => diff(freeVars(o), [a]),
  };

  return cases[type.type](type as any);
}

/** Returns the first collection with any elements in the second removed, i.e. a \ b */
function diff<T>(a: T[], b: T[]): T[] {
  const bset = new Set(b);
  return a.filter((v) => !bset.has(v));
}

const isContext = (type: Monotype | Polytype | Context): type is Context => typeof type.type !== 'string';
