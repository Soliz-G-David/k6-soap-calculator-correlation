import { SOAP_NAMESPACE } from "../config/config.js";

// Builds the SOAP 1.1 envelope for any calculator operation (Add, Multiply, Subtract, Divide).
export function buildEnvelope(operation, intA, intB) {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <${operation} xmlns="${SOAP_NAMESPACE}">
      <intA>${intA}</intA>
      <intB>${intB}</intB>
    </${operation}>
  </soap:Body>
</soap:Envelope>`;
}

// Builds the HTTP headers required by a SOAP 1.1 request.
export function buildHeaders(operation) {
  return {
    "Content-Type": "text/xml; charset=utf-8",
    SOAPAction: `"${SOAP_NAMESPACE}${operation}"`,
  };
}

// Correlation helper: extracts the value of <OperationResult> from the SOAP response.
// Example: extractResult(body, 'Add') reads <AddResult>8</AddResult> and returns "8".
export function extractResult(body, operation) {
  const regex = new RegExp(`<${operation}Result>(.*?)</${operation}Result>`);
  const match = body ? body.match(regex) : null;
  return match ? match[1] : null;
}
