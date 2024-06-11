import { describe, it, expect } from 'vitest';
import { extractDomain } from './extract-domain';

const testCases = [
  {
    input: 'https://www.example.com',
    output: 'Example.com',
  },
  {
    input: 'http://subdomain.example.co.uk',
    output: 'Co.uk',
  },
  {
    input: 'ftp://example.org/?query=string',
    output: 'Example.org',
  },
  {
    input: 'https://localhost',
    output: 'Localhost',
  },
  {
    input: 'https://127.0.0.1',
    output: '0.1',
  },
  {
    input: 'https://example',
    output: 'Example',
  },
  {
    input: '',
    output: '',
  },
  {
    input: 'invalid-url',
    output: '',
  },
];

describe('extractDomain()', () => {
  it('extracts and capitalizes the domain correctly', () => {
    testCases.forEach(({ input, output }) => {
      expect(extractDomain(input)).toBe(output);
    });
  });
});
