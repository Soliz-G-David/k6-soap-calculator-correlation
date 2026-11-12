// URL of the online calculator service we are going to test
export const BASE_URL = 'http://www.dneonline.com/calculator.asmx';

// Fixed address the service needs in every request
export const SOAP_NAMESPACE = 'http://tempuri.org/';

// Numbers used in the test: 5 + 3 = 8, then 8 x 2 = 16, then 16 - 4 = 12
export const TEST_DATA = {
  add: { intA: 5, intB: 3 },
  multiply: { intB: 2 },
  subtract: { intB: 4 },
};