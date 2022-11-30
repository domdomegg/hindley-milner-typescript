import { parse } from '../src/parse';
import { M } from '../src/algorithm-m';
import { Context } from '../src/types';
import { newTypeVar } from '../src/helpers';

test('variable', () => {
  const expr = parse('myVar');
  const context: Context = { myVar: { type: 'app', C: 'Int', t: [] } };

  const t = newTypeVar();
  const s = M(context, expr, t);
  const type = s(t);

  expect(type).toEqual({ type: 'app', C: 'Int', t: [] });
});

test('abstraction and application', () => {
  const expr = parse('(\\x -> odd x) myVar');
  const context: Context = {
    myVar: { type: 'app', C: 'Int', t: [] },
    odd: {
      type: 'app',
      C: '->',
      t: [
        { type: 'app', C: 'Int', t: [] },
        { type: 'app', C: 'Bool', t: [] },
      ],
    },
  };

  const t = newTypeVar();
  const s = M(context, expr, t);
  const type = s(t);

  expect(type).toEqual({ type: 'app', C: 'Bool', t: [] });
});

test('let', () => {
  const expr = parse('let id = (\\x -> x) in (id (odd (id myVar)))');
  const context: Context = {
    myVar: { type: 'app', C: 'Int', t: [] },
    odd: {
      type: 'app',
      C: '->',
      t: [
        { type: 'app', C: 'Int', t: [] },
        { type: 'app', C: 'Bool', t: [] },
      ],
    },
  };

  const t = newTypeVar();
  const s = M(context, expr, t);
  const type = s(t);

  expect(type).toEqual({ type: 'app', C: 'Bool', t: [] });
});
