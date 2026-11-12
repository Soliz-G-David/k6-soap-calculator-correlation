import http from "k6/http";
import { check } from "k6";
import { BASE_URL, TEST_DATA } from "../config/config.js";
import { buildEnvelope, buildHeaders, extractResult } from "../utils/soap.js";

// Pass/fail rules for the whole test
export const options = {
  thresholds: {
    http_req_failed: ["rate==0"], // no request is allowed to fail
    http_req_duration: ["p(95)<1000"], // 95% of requests must answer in under 1 second
    checks: ["rate==1"], // every check must pass
  },
};

export default function () {
  // Step 1: send the first two numbers to Add
  const { intA, intB } = TEST_DATA.add;
  const addResponse = http.post(BASE_URL, buildEnvelope("Add", intA, intB), {
    headers: buildHeaders("Add"),
    tags: { name: "Add" },
  });

  // Correlation 1: take the result of Add from the response and save it
  const addResult = extractResult(addResponse.body, "Add");
  console.log(
    `Add: ${intA} + ${intB} = ${addResult} (status ${addResponse.status})`,
  );

  // Verify Add answered OK and the result is correct
  const expectedAdd = intA + intB;
  check(addResponse, {
    "Add: status is 200": (r) => r.status === 200,
    [`Add: result is ${expectedAdd}`]: () => Number(addResult) === expectedAdd,
  });

  // Step 2: send the saved Add result to Multiply (not typed by hand)
  const multiplyBy = TEST_DATA.multiply.intB;
  const multiplyResponse = http.post(
    BASE_URL,
    buildEnvelope("Multiply", addResult, multiplyBy),
    {
      headers: buildHeaders("Multiply"),
      tags: { name: "Multiply" },
    },
  );

  // Correlation 2: take the result of Multiply from the response and save it
  const multiplyResult = extractResult(multiplyResponse.body, "Multiply");
  console.log(
    `Multiply: ${addResult} x ${multiplyBy} = ${multiplyResult} (status ${multiplyResponse.status})`,
  );

  // Verify Multiply answered OK and the result is correct
  const expectedMultiply = expectedAdd * multiplyBy;
  check(multiplyResponse, {
    "Multiply: status is 200": (r) => r.status === 200,
    [`Multiply: result is ${expectedMultiply}`]: () =>
      Number(multiplyResult) === expectedMultiply,
  });

  // Step 3: send the saved Multiply result to Subtract (not typed by hand)
  const subtractBy = TEST_DATA.subtract.intB;
  const subtractResponse = http.post(
    BASE_URL,
    buildEnvelope("Subtract", multiplyResult, subtractBy),
    {
      headers: buildHeaders("Subtract"),
      tags: { name: "Subtract" },
    },
  );

  // Final result of the whole flow
  const subtractResult = extractResult(subtractResponse.body, "Subtract");
  console.log(`Subtract: ${multiplyResult} - ${subtractBy} = ${subtractResult} (status ${subtractResponse.status})`,
  );

  // Verify Subtract answered OK and the final result is correct
  const expectedSubtract = expectedMultiply - subtractBy;
  check(subtractResponse, {
    "Subtract: status is 200": (r) => r.status === 200,
    [`Subtract: result is ${expectedSubtract}`]: () =>
      Number(subtractResult) === expectedSubtract,
  });
}
