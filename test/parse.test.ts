import { parse } from '../src/parse';

test('variables', () => {
  expect(parse('myVar')).toEqual({ type: 'var', x: 'myVar' });
});

test('abstraction', () => {
  expect(parse('\\z -> y')).toEqual({ type: 'abs', x: 'z', e: { type: 'var', x: 'y' } });
});

test('let', () => {
  expect(parse('let z = thing in z')).toEqual({ type: 'let', x: 'z', e1: { type: 'var', x: 'thing' }, e2: { type: 'var', x: 'z' } });
});

test('applications', () => {
  expect(parse('myFunc myArg')).toEqual({ type: 'app', e1: { type: 'var', x: 'myFunc' }, e2: { type: 'var', x: 'myArg' } });
  expect(parse('myFunc arg1 arg2')).toEqual({ type: 'app', e1: { type: 'app', e1: { type: 'var', x: 'myFunc' }, e2: { type: 'var', x: 'arg1' } }, e2: { type: 'var', x: 'arg2' } });
});
