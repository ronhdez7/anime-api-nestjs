/**
 * If condition is false, skips
 * @param condition Checked for truthiness
 */
export function testIf(condition: any) {
  return condition ? test : test.skip;
}
