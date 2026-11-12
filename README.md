# k6 SOAP Calculator – 2-Step Correlation

Performance test built with **k6** that chains three operations of the public [DNEOnline SOAP Calculator](http://www.dneonline.com/calculator.asmx) service using **correlation**: the result of each request is captured from the response and sent automatically to the next one.

## What is correlation?

In real applications many values change on every run (session tokens, order IDs, etc.). If they are hardcoded in a script, the next request fails.
**Correlation** means capturing that dynamic value from a response, saving it in a variable and reusing it in the following request.

In this project, the dynamic value is the result of each calculator operation.

## Test flow

```
Add (5 + 3)          → returns 8
   │  Correlation 1: extract <AddResult> → addResult
   ▼
Multiply (addResult x 2)   → returns 16
   │  Correlation 2: extract <MultiplyResult> → multiplyResult
   ▼
Subtract (multiplyResult - 4) → returns 12
```

Only the first two numbers (`5` and `3`) are written by hand. Every other input comes from the previous response.

## Tech stack

| Tool                      | Purpose                           |
| ------------------------- | --------------------------------- |
| [k6](https://k6.io/) v2.x | Load testing and script execution |
| JavaScript (ES modules)   | Test scripts                      |
| SOAP 1.1 / XML            | Service protocol                  |
| Git & GitHub              | Version control                   |

## Project structure

```
k6-soap-calculator-correlation/
├── config/
│   └── config.js                  # Service URL, SOAP namespace and test data
├── utils/
│   └── soap.js                    # Builds SOAP requests and extracts results (correlation)
├── tests/
│   └── calculator-correlation.js  # Main test: flow, checks, thresholds and load profile
├── .gitignore
└── README.md
```

## Prerequisites

- [k6](https://grafana.com/docs/k6/latest/set-up/install-k6/) installed
  - Windows: `winget install k6 --source winget`
  - macOS: `brew install k6`
- Check the installation:
  ```bash
  k6 version
  ```

## How to run

```bash
git clone https://github.com/Soliz-G-David/k6-soap-calculator-correlation.git
cd k6-soap-calculator-correlation
k6 run tests/calculator-correlation.js
```

## Load profile

The service is public and free, so the load is intentionally light.

| Stage     | Duration | Virtual users |
| --------- | -------- | ------------- |
| Ramp up   | 10s      | 0 → 5         |
| Steady    | 20s      | 5             |
| Ramp down | 10s      | 5 → 0         |

Each virtual user waits 1 second between runs, like a real user.

## Checks and thresholds

**Checks** (validated on every request):

- Each operation returns HTTP `200`
- Each result is correct: Add = `8`, Multiply = `16`, Subtract = `12`

**Thresholds** (the test fails if any of these is not met):

| Metric              | Rule         | Meaning                                  |
| ------------------- | ------------ | ---------------------------------------- |
| `http_req_failed`   | `rate==0`    | No request is allowed to fail            |
| `http_req_duration` | `p(95)<1000` | 95% of requests answer in under 1 second |
| `checks`            | `rate==1`    | Every check must pass                    |

## Sample results

| Metric                  | Value            |
| ----------------------- | ---------------- |
| Max virtual users       | 5                |
| Iterations (full flows) | 95               |
| HTTP requests           | 285              |
| Checks passed           | 570 / 570 (100%) |
| Avg response time       | 220.2 ms         |
| p(95) response time     | 230.97 ms        |
| Failed requests         | 0%               |

All thresholds passed ✓

## Author

**David Soliz Garcia** – QA Automation Engineer
GitHub: [@Soliz-G-David](https://github.com/Soliz-G-David)
