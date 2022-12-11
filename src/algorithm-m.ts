import { generalise, instantiate, newTypeVar, unify } from './helpers';
import { Context, Expression, Monotype } from './models';
import { Substitution } from './substitutions';

export const M = (typEnv: Context, expr: Expression, type: Monotype): Substitution => {
  const cases: { [K in Expression['type']]: (e: Expression & { type: K }) => Substitution } = {
    var: ({ x }) => {
      if (typEnv[x] === undefined) throw new Error(`Undefined variable: ${x}`);
      return unify(type, instantiate(typEnv[x]));
    },
    abs: ({ x, e }) => {
      const [beta1, beta2] = [newTypeVar(), newTypeVar()];
      const s1 = unify(type, { type: 'app', C: '->', t: [beta1, beta2] });
      const s2 = M({ ...s1(typEnv), [x]: s1(beta1) }, e, s1(beta2));
      return s2(s1);
    },
    app: ({ e1, e2 }) => {
      const beta = newTypeVar();
      const s1 = M(typEnv, e1, { type: 'app', C: '->', t: [beta, type] });
      const s2 = M(s1(typEnv), e2, s1(beta));
      return s2(s1);
    },
    let: ({ x, e1, e2 }) => {
      const beta = newTypeVar();
      const s1 = M(typEnv, e1, beta);
      const s2 = M({ ...s1(typEnv), [x]: generalise(typEnv, s1(beta)) }, e2, s1(type));
      return s2(s1);
    },
  };

  return cases[expr.type](expr as any);
};
