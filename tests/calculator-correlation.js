import http from 'k6/http';
import { BASE_URL, TEST_DATA } from '../config/config.js';
import { buildEnvelope, buildHeaders, extractResult } from '../utils/soap.js';

export default function () {
  // Step 1: send the first two numbers to Add
  const { intA, intB } = TEST_DATA.add;
  const addResponse = http.post(BASE_URL, buildEnvelope('Add', intA, intB), {
    headers: buildHeaders('Add'),
    tags: { name: 'Add' },
  });

  // Correlation 1: take the result of Add from the response and save it
  const addResult = extractResult(addResponse.body, 'Add');
  console.log(`Add: ${intA} + ${intB} = ${addResult} (status ${addResponse.status})`);

  // Step 2: send the saved Add result to Multiply (not typed by hand)
  const multiplyBy = TEST_DATA.multiply.intB;
  const multiplyResponse = http.post(BASE_URL, buildEnvelope('Multiply', addResult, multiplyBy), {
    headers: buildHeaders('Multiply'),
    tags: { name: 'Multiply' },
  });

  // Save the result of Multiply for the next step
  const multiplyResult = extractResult(multiplyResponse.body, 'Multiply');
  console.log(`Multiply: ${addResult} x ${multiplyBy} = ${multiplyResult} (status ${multiplyResponse.status})`);
}