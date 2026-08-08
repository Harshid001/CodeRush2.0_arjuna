**Corrected:** “Now give me questions that the judges can ask.”

Based on your **NexusAPI problem statement and current implementation**, prepare for these questions. I’ve grouped them by difficulty so you can practice efficiently.

## 🔥 Most likely questions

### 1. What problem does NexusAPI solve?

**Answer:** NexusAPI is a pay-per-use AI/data API marketplace where an agent can discover providers, compare them on price, quality, latency and reliability, apply spending policies, make an x402 payment, execute the selected capability, and return a verifiable result, receipt and invoice.

### 2. Why do you need a marketplace?

**Answer:** Instead of developers manually searching for APIs and managing separate accounts/API keys, NexusAPI provides a common catalog where providers can be discovered and evaluated using standardized metadata.

### 3. Why is this "agentic"?

**Answer:** The user gives a task rather than manually choosing an API. The agent understands the task, discovers candidates, evaluates them, checks policies, selects the best eligible provider, initiates payment, executes the capability, and returns the result.

### 4. Why are you using DeepSeek?

**Answer:** DeepSeek is used for **intent extraction**, not for payment or provider selection. It converts natural-language requests into structured information such as category, priority, budget and constraints. The actual provider decision remains deterministic through our Policy and Decision Engines.

### 5. Why don't you let DeepSeek choose the provider?

**Answer:** An LLM should not have unrestricted authority over spending. We keep financial decisions deterministic. DeepSeek understands the task, while our Policy Engine enforces constraints and our Decision Engine calculates the provider score.

---

# 💰 Payment / x402 questions

### 6. Explain your x402 flow.

```text
Request
 ↓
402 Payment Required
 ↓
Payment Requirements
 ↓
Lute Wallet Signature
 ↓
Algorand Testnet Settlement
 ↓
Payment Verification
 ↓
Provider Execution
 ↓
Receipt
```

### 7. What happens when the server returns HTTP 402?

**Answer:** The client interprets the payment requirements, verifies that they satisfy the agent's policy, constructs the permitted payment, asks Lute to sign it, and retries the request with the payment information.

### 8. Why x402 instead of normal payment?

**Answer:** x402 is designed around payment at the HTTP request boundary, which fits pay-per-request machine-to-machine commerce. It avoids requiring a traditional account/subscription relationship for every provider.

### 9. Why Algorand?

**Answer:** Our hackathon track supports Algorand, and its low-cost, fast transactions are suitable for micropayments. We're using Algorand Testnet for the demonstration.

### 10. Why Lute?

**Answer:** Lute provides the wallet/signing boundary for our Algorand payment flow. The application can request authorization without handling or exposing the user's private key.

### 11. Can your application automatically approve the Lute transaction?

**Answer:** No. The wallet signature is intentionally a user-consent boundary. Our agent automates the workflow before and after the signature, but it should not silently sign a real blockchain transaction.

---

# 🤖 Agent questions

### 12. What exactly does your AI agent do?

```text
User Task
 ↓
Intent Extraction
 ↓
Provider Discovery
 ↓
Comparison
 ↓
Policy Check
 ↓
Decision
 ↓
Payment
 ↓
Execution
 ↓
Result
 ↓
Receipt
 ↓
Invoice
```

### 13. How does the agent know which API is good?

**Answer:** It doesn't simply ask the LLM which API is good. We calculate a deterministic score using provider metadata such as:

* Quality
* Price efficiency
* Latency
* Reliability

Then the Policy Engine removes providers that violate constraints.

### 14. What happens if the cheapest provider isn't the best?

**Answer:** Price is only one factor. The Decision Engine uses multiple factors, so a slightly more expensive provider can win if its quality, latency and reliability produce a better overall score within the user's policy.

### 15. What happens if no provider satisfies the policy?

**Answer:** The purchase is blocked and the agent explains why—for example, all available providers may exceed the budget or fail the minimum quality requirement.

---

# 🛡️ Policy Engine questions

### 16. What policies do you enforce?

Your current implementation includes:

* Per-request budget
* Daily spending limit
* Provider daily cap
* Minimum quality
* Allowed payment schemes

### 17. Why do you need a Policy Engine if you already have an AI agent?

**Answer:** Because AI-generated decisions should not have unrestricted spending authority. The Policy Engine acts as a deterministic safety boundary.

### 18. Can the LLM override the budget?

**Answer:** No.

```text
DeepSeek
   ↓
Intent
   ↓
Policy Engine
   ↓
Allowed / Blocked
```

The LLM cannot bypass policy rules.

---

# 🧠 Decision Engine questions

### 19. How do you calculate the best provider?

Your current scoring approach is:

```text
Quality       40%
Price         30%
Latency       20%
Reliability   10%
```

The candidates are normalized before calculating the weighted score.

### 20. Why these weights?

**Answer:** Quality is the highest priority because a cheap API that produces poor results is not useful. Price is next because this is a pay-per-use marketplace, followed by latency and reliability.

### 21. Can the weights change?

**Answer:** Yes. They can be configured based on the user's priority. For example, a latency-sensitive application could prioritize latency over price.

---

# 🔄 Failure questions — VERY IMPORTANT

Your problem statement explicitly talks about failure handling, so expect these.

### 22. What happens if the selected provider goes down?

**Answer:**

```text
Selected Provider
 ↓
Failure
 ↓
Bounded Retry
 ↓
Fallback Provider
 ↓
Execute
```

The agent should not blindly retry indefinitely.

### 23. How do you prevent double spending during retry?

**Answer:** Every purchase/request should have a unique request/payment identifier and nonce. Provider execution retries are separated from payment creation so a provider failure does not automatically create another payment.

### 24. What happens if payment succeeds but the provider fails?

**Answer:** The system records the payment and provider failure in the trace and applies the defined refund/compensation semantics rather than silently charging again.

---

# 🧪 Dummy Provider questions

### 25. Are these real APIs?

**Answer:** The marketplace providers are currently **demo/simulated providers**. Their catalog metadata is realistic, but their execution is simulated through provider adapters.

### 26. Then how do you return a result without an API key?

**Answer:** We created a Provider Execution Layer with category-specific mock adapters.

For example:

```text
Translation Provider
 ↓
Translation Adapter
 ↓
Simulated Translation Result
```

The important thing we're demonstrating is the **discovery → evaluation → payment → execution → receipt** architecture.

### 27. Why didn't you integrate real APIs?

**Answer:** The hackathon demonstration uses controlled sample providers so we can reliably demonstrate payment, policy, failure, fallback and provenance without depending on third-party API availability or exposing provider credentials.

---

# 🔐 Security questions

### 28. Where are API keys stored?

**Answer:** Provider credentials, when required for a real integration, remain server-side and are never exposed to the user or frontend.

### 29. Does the user receive the provider's API key?

**Answer:** No. The user receives the capability result, not the provider's credentials.

### 30. Can a malicious provider tell the agent to ignore its policies?

**Answer:** No. Provider content is treated as untrusted data. Payment policy and decision rules remain separate from provider-generated content.

---

# 📊 Provenance questions

### 31. What is provenance in your system?

**Answer:** Provenance connects the task to the provider, provider version, input/output information, timestamp, cost, payment and settlement receipt so the transaction can be audited or replayed.

### 32. Why generate a receipt?

**Answer:** A payment alone isn't enough. The receipt provides evidence of what was purchased, from whom, at what cost, and what settlement/payment state occurred.

### 33. Why generate an invoice?

**Answer:** It gives the user a human-readable record of the completed purchase and cost, while the receipt/provenance data provides the machine-verifiable evidence.

---

# 💡 Architecture questions

### 34. Why Next.js?

**Answer:** It gives us a strong React-based frontend with App Router capabilities while allowing clean integration with our backend services.

### 35. Why Express + MongoDB?

**Answer:** Express provides a lightweight API layer, while MongoDB fits our provider catalog, transaction, receipt, policy and trace data.

### 36. Why separate Policy Engine and Decision Engine?

**Answer:**

**Policy Engine = "Is this provider allowed?"**

**Decision Engine = "Which allowed provider is best?"**

That's an important distinction.

---

# 🏆 Questions designed to challenge you

### 37. What if the LLM gives incorrect intent?

**Answer:** The structured intent is validated before entering the purchasing workflow. If it cannot be safely interpreted, the transaction is stopped rather than allowing an unsafe purchase.

### 38. What if the provider price changes between marketplace search and payment?

**Answer:** The payment requirement received at the payment boundary is validated against the agent's policy. If the new amount exceeds the allowed budget, the purchase is blocked.

### 39. What if a provider disappears after the 402 response?

**Answer:** The payment/execution state is preserved, and the agent can use bounded fallback logic rather than repeatedly purchasing from another provider.

### 40. What prevents an agent from spending $100 when the user only allowed $5?

**Answer:**

```text
User Policy
 ↓
Policy Engine
 ↓
Maximum $5
 ↓
Every purchase checked
```

The Decision Engine cannot bypass that limit.

---

# 🎯 The 10 questions I would memorize first

If you have very little time, prepare perfect answers for these:

1. **What problem are you solving?**
2. **Why is this agentic?**
3. **Why DeepSeek?**
4. **How does the agent choose the best provider?**
5. **How does your Policy Engine prevent overspending?**
6. **Explain your x402 flow.**
7. **Why Algorand + Lute?**
8. **What happens when a provider fails?**
9. **How do you prevent double payment?**
10. **If your providers are dummy, how do you actually produce a result?**

That last question is particularly important for your current implementation. Be completely transparent: **the provider execution is simulated, while the marketplace, policy, decision, wallet, payment, provenance, receipt and invoice workflow demonstrate the architecture.**