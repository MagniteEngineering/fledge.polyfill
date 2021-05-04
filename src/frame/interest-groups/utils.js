/*
 * @function
 * @name getIGKey
 * @description retrieve the key for an interest group form the store
 * @author Newton <cnewton@magnite.com>
 * @param {string} owner - owner of the interest group
 * @param {string} name - name of the interest group
 * @return {object} an object representing an interest group
 *
 * @example
 *   getKey('foo', 'bar');
 *   // 'foo-bar'
 */
export const getIGKey = (owner, name) => `${owner}-${name}`;
