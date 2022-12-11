import { parse } from '../src/parse';
import { W } from '../src/algorithm-w';
import { Context } from '../src/models';

test('variable', () => {
  const expr = parse('myVar');
  const context: Context = { myVar: { type: 'app', C: 'Int', t: [] } };

  const [, type] = W(context, expr);

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

  const [, type] = W(context, expr);

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

  const [, type] = W(context, expr);

  expect(type).toEqual({ type: 'app', C: 'Bool', t: [] });
});
