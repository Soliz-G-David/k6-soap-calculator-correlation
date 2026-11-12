import http from 'k6/http';
import { BASE_URL, TEST_DATA } from '../config/config.js';
import { buildEnvelope, buildHeaders, extractResult } from '../utils/soap.js';

export default function () {
  // Step 1: Add (the only hardcoded input of the flow)
  const { intA, intB } = TEST_DATA.add;

  const addResponse = http.post(BASE_URL, buildEnvelope('Add', intA, intB), {
    headers: buildHeaders('Add'),
    tags: { name: 'Add' },
  });

  const addResult = extractResult(addResponse.body, 'Add');
  console.log(`Add: ${intA} + ${intB} = ${addResult} (status ${addResponse.status})`);
}