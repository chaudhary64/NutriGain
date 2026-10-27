/**
 * lib/authForm.js — the rules the login and signup forms run before a
 * round-trip, plus the post-login destination check.
 *
 * The API stays the authority for these rules; these tests pin the client-side
 * mirror so the two cannot drift apart silently.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  passwordStrength,
  readSafeNext,
  validateLogin,
  validateRegister,
} from '../lib/authForm.js';

const VALID_SIGNUP = {
  name: 'Chirag',
  email: 'chirag@example.com',
  password: 'secret1',
  confirmPassword: 'secret1',
};

test('login reports each empty field separately', () => {
  const errors = validateLogin({ email: '   ', password: '' });
  assert.deepEqual(Object.keys(errors).sort(), ['email', 'password']);
});

test('login accepts a well-formed pair', () => {
  assert.deepEqual(validateLogin({ email: 'a@b.co', password: 'hunter2' }), {});
});

test('login trims the email before validating it', () => {
  assert.deepEqual(validateLogin({ email: '  a@b.co  ', password: 'hunter2' }), {});
});

test('login rejects an address without a domain dot', () => {
  const errors = validateLogin({ email: 'a@b', password: 'hunter2' });
  assert.ok(errors.email);
  assert.match(errors.email, /look right/i);
});

test('signup accepts a valid form', () => {
  assert.deepEqual(validateRegister(VALID_SIGNUP), {});
});

test('signup bounds the name at 2 to 80 characters', () => {
  assert.match(validateRegister({ ...VALID_SIGNUP, name: 'C' }).name, /at least 2/i);
  assert.match(validateRegister({ ...VALID_SIGNUP, name: 'x'.repeat(81) }).name, /under 80/i);
});

test('signup bounds the password at 6 to 128 characters', () => {
  assert.match(
    validateRegister({ ...VALID_SIGNUP, password: '12345', confirmPassword: '12345' }).password,
    /at least 6/i
  );
  const long = 'x'.repeat(129);
  assert.match(
    validateRegister({ ...VALID_SIGNUP, password: long, confirmPassword: long }).password,
    /under 128/i
  );
});

test('signup catches a confirmation that does not match', () => {
  const errors = validateRegister({ ...VALID_SIGNUP, confirmPassword: 'secret2' });
  assert.ok(errors.confirmPassword);
  assert.match(errors.confirmPassword, /match/i);
});

test('passwordStrength scores 0 to 4 and rewards length, case, digits, symbols', () => {
  assert.equal(passwordStrength(''), 0);
  assert.equal(passwordStrength('abc'), 0);
  assert.equal(passwordStrength('abcdefgh'), 1); // length only
  assert.equal(passwordStrength('Abcdefgh'), 2); // + mixed case
  assert.equal(passwordStrength('Abcdefg1'), 3); // + digit
  assert.equal(passwordStrength('Abcdefg1!'), 4); // + symbol
  assert.equal(passwordStrength('abcdefghijklmn'), 2); // long, but no case or digit
});

test('passwordStrength never exceeds the meter ceiling', () => {
  for (const pw of ['a', 'aB3!', 'aaaaaaaaaaaaaaaaaaaaaaaa', 'A1!'.repeat(10)]) {
    const score = passwordStrength(pw);
    assert.ok(Number.isInteger(score) && score >= 0 && score <= 4, `${pw} scored ${score}`);
  }
});

test('readSafeNext allows app-internal paths', () => {
  assert.equal(readSafeNext('?next=/dashboard'), '/dashboard');
  assert.equal(readSafeNext('?next=/gym?tab=sessions'), '/gym?tab=sessions');
});

test('readSafeNext rejects absolute and protocol-relative URLs', () => {
  assert.equal(readSafeNext('?next=https://evil.example'), '');
  assert.equal(readSafeNext('?next=//evil.example'), '');
  assert.equal(readSafeNext('?next=dashboard'), '');
});

test('readSafeNext keeps the user off the auth pages', () => {
  assert.equal(readSafeNext('?next=/login'), '');
  assert.equal(readSafeNext('?next=/register'), '');
});

test('readSafeNext returns empty when nothing was asked for', () => {
  assert.equal(readSafeNext(''), '');
  assert.equal(readSafeNext('?next='), '');
  assert.equal(readSafeNext('?other=1'), '');
});
