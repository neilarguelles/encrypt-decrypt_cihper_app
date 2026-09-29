import { test } from 'node:test';
import assert from 'node:assert/strict';
import { transform } from '../src/ciphers.js';

test('Caesar known example and alphabet wraparound', () => {
  assert.equal(transform('Hello, World! XYZ', 'caesar', '3'), 'Khoor, Zruog! ABC');
  assert.equal(transform('Khoor, Zruog!', 'caesar', '3', 'decrypt'), 'Hello, World!');
});
test('Vigenere known example, skipping spaces in keyword position', () => {
  assert.equal(transform('ATTACK AT DAWN!', 'vigenere', 'LEMON'), 'LXFOPV EF RNHR!');
  assert.equal(transform('LXFOPV EF RNHR!', 'vigenere', 'lemon', 'decrypt'), 'ATTACK AT DAWN!');
});
test('round trips preserve case, symbols, numbers and Unicode', () => {
  const message = 'Hello, Zz! 123 — café 🔒';
  for (let key = 0; key < 26; key++) assert.equal(transform(transform(message, 'caesar', key), 'caesar', key, 'decrypt'), message);
  assert.equal(transform(transform(message, 'vigenere', 'Secret'), 'vigenere', 'Secret', 'decrypt'), message);
});
test('invalid keys are rejected', () => {
  for (const key of ['', '-1', '26', '1.5', 'abc']) assert.throws(() => transform('test', 'caesar', key));
  for (const key of ['', 'a b', '123', 'é']) assert.throws(() => transform('test', 'vigenere', key));
});
