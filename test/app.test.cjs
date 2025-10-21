const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const app = require('../dist/app.js').default;

test('GET / returns Hello!', async () => {
  const res = await request(app).get('/');
  assert.equal(res.statusCode, 200);
  assert.equal(res.text, 'Hello!');
});
