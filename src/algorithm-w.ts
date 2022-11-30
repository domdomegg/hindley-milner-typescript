import { generalise, instantiate, newTypeVar, unify } from './helpers';
import { Context, Expression, Monotype } from './types';
import { id, Substitution } from './substitutions';

export const W = (typEnv: Context, expr: Expression): [Substitution, Monotype] => {
  const cases: { [K in Expression['type']]: (e: Expression & { type: K }) => [Substitution, Monotype] } = {
    var: ({ x }) => {
      if (typEnv[x] === undefined) throw new Error(`Undefined variable: ${x}`);
      return [id, instantiate(typEnv[x])];
    },
    abs: ({ x, e }) => {
      const beta = newTypeVar();
      const [s1, t1] = W({ ...typEnv, [x]: beta }, e);
      return [s1, s1({ type: 'app', C: '->', t: [beta, t1] })];
    },
    app: ({ e1, e2 }) => {
      const [s1, t1] = W(typEnv, e1);
      const [s2, t2] = W(s1(typEnv), e2);
      const beta = newTypeVar();
      const s3 = unify(s2(t1), { type: 'app', C: '->', t: [t2, beta] });
      return [s3(s2(s1)), s3(beta)];
    },
    let: ({ x, e1, e2 }) => {
      const [s1, t1] = W(typEnv, e1);
      const [s2, t2] = W({ ...s1(typEnv), [x]: generalise(s1(typEnv), t1) }, e2);
      return [s2(s1), t2];
    },
  };

  return cases[expr.type](expr as any);
};
