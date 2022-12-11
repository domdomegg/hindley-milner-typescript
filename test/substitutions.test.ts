import { id, makeSubstitution } from '../src/substitutions';
import { TypeVariable } from '../src/models';

const [t0, t1, t2, t3]: TypeVariable[] = [0, 1, 2, 3].map((v) => ({ type: 'var', a: `t${v.toString()}` }));

test('combines substitutions correctly', () => {
  expect(makeSubstitution({ t0: t2 })(makeSubstitution({ t1: t3 })).raw).toEqual({ t0: t2, t1: t3 });

  expect(makeSubstitution({ t0: t1 })(makeSubstitution({ t1: t2 })).raw).toEqual({ t1: t2, t0: t1 });
  expect(makeSubstitution({ t1: t2 })(makeSubstitution({ t0: t1 })).raw).toEqual({ t0: t2, t1: t2 });
});

test('combines equivalence', () => {
  expect(makeSubstitution({ t0: t1 })(t0)).toEqual(t1);

  expect(makeSubstitution({ t1: t2 })(makeSubstitution({ t0: t1 })(t0))).toEqual(t2);
  expect(makeSubstitution({ t1: t2 })(makeSubstitution({ t0: t1 }))(t0)).toEqual(t2);

  expect(makeSubstitution({ t2: t3 })(makeSubstitution({ t1: t2 })(makeSubstitution({ t0: t1 })(t0)))).toEqual(t3);
  expect(makeSubstitution({ t2: t3 })(makeSubstitution({ t1: t2 }))(makeSubstitution({ t0: t1 }))(t0)).toEqual(t3);

  // NB: substitution should happen at once, so only t1/t0 gets applied
  expect(makeSubstitution({ t0: t1, t1: t2 })(t0)).toEqual(t1);

  // ...but applying a t2/t1 afterwards should still get applied
  expect(makeSubstitution({ t1: t2 })(makeSubstitution({ t0: t1, t1: t2 })(t0))).toEqual(t2);
  expect(makeSubstitution({ t1: t2 })(makeSubstitution({ t0: t1, t1: t2 }))(t0)).toEqual(t2);

  // If we apply the t3/t2 first, there are no t2s to match at that point
  expect(makeSubstitution({ t1: t2 })(makeSubstitution({ t0: t1 })(makeSubstitution({ t2: t3 })(t0)))).toEqual(t2);
  expect(makeSubstitution({ t1: t2 })(makeSubstitution({ t0: t1 }))(makeSubstitution({ t2: t3 }))(t0)).toEqual(t2);

  expect(makeSubstitution({})(t0)).toEqual(t0);
});

test('identity substitution does not change anything', () => {
  expect(id(t0)).toEqual(t0);
});
