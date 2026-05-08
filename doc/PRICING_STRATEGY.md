# SellerSaathi Pricing & Packaging Strategy

This document outlines the pricing strategy for SellerSaathi, based on value-based pricing principles and tailored to the Amazon/Flipkart seller ecosystem in India.

## 1. Target Personas & Segmentation

We segment the market into three distinct personas with varying willingness-to-pay (WTP) and usage patterns:

1. **The Casual/New Seller (Self-Managed)**
   - **Profile:** 1-50 SKUs. Low budget. Needs basic optimization to get off the ground.
   - **Value Driver:** Needs basic SEO to get first sales and discoverability.
   - **Target Plan:** Free (Trial) / Growth

2. **The Established D2C Brand / Power Seller**
   - **Profile:** 50-500+ SKUs. Regular new product launches. High fear of account suspension.
   - **Value Driver:** Continuous optimization, tracking SEO scores, and suspension recovery (insurance).
   - **Target Plan:** Pro

3. **The Seller Agency / Account Manager**
   - **Profile:** Manages 5-20 different seller accounts. High volume.
   - **Value Driver:** Speed of execution, bulk operations, team access.
   - **Target Plan:** Agency

## 2. Value Metric Selection

**Primary Value Metric:** Usage-Based (Credits)
- **Why:** The value scales directly with the number of products optimized and the number of suspension appeals generated. 
- **Definition:** 1 Listing Optimization = 1 Credit | 1 POA Generation = 2 Credits.

**Secondary Value Metric (Packaging Levers):**
- **Feature Access:** POA Generator (Suspension appeals) is gated for Pro+. Bulk CSV uploads, API access are gated for Agency.
- **Seats:** Team access (reserved for Agency).

*Validation Check:* As customers get more value (optimize more listings or manage more accounts), they naturally pay more. This metric is aligned.

## 3. Tier Structure (Good / Better / Best)

### 1. Free (Entry / Reverse Trial)
- **Packaging:** 3 lifetime credits. Single language (English). Watermarked PDF.
- **Strategy:** This is essentially a **Usage-Limited Free Trial**. It removes friction for adoption, letting sellers experience the "aha" moment of seeing a beautifully optimized listing before hitting the paywall.

### 2. Growth (The Entry Point) — ₹499/month
- **Target:** Casual Sellers.
- **Packaging:** 10 credits/month. All languages, clean PDFs, SEO scores. (No POA Generator).
- **Strategy:** Low barrier to entry. Gives basic sellers enough to optimize their new products each month without paying a premium.

### 3. Pro (The Anchor / "Insurance" Plan) — ₹1,499/month
- **Target:** Small Sellers & D2C Brands.
- **Packaging:** 50 credits/month. All Growth features + **POA Generator** + priority support.
- **Strategy:** Priced as an impulse B2B purchase. This acts as the default tier because it includes the POA (Plan of Action) generator, which acts as "insurance" against devastating account suspensions.

### 4. Agency (The Premium) — ₹4,999/month
- **Target:** Agencies & High-volume resellers.
- **Packaging:** 200 credits/month. Bulk uploads, API access, up to 5 team seats.
- **Strategy:** Captures the highest willingness-to-pay segment. Proper B2B pricing for those making money off the tool.

### Add-on Strategy (Expansion)
- **Top-up Credits:** ₹49/credit.
- **Why:** Prevents forced upgrades for temporary usage spikes (e.g., a small seller launching 5 new products in one month but who doesn't need the Agency plan).

## 4. Price Rationale & Market Context

```text
Customer perceived value: ₹5,000 - ₹20,000/mo (Agency retainer fee)
───────────────────────────────
Your price: ₹1,499/mo (Pro)
───────────────────────────────
Next best alternative: ₹500 - ₹1000 per listing (Freelancer on Fiverr/Upwork)
───────────────────────────────
Your cost to serve: LLM API costs (~₹5-10 per request)
```
- **Value Surplus:** The seller saves thousands of rupees and days of turnaround time, leaving a massive customer surplus.
- **Cost Floor:** At ₹1,499 for 50 credits, the revenue per credit is ~₹30. If API costs are ₹5-10, the gross margin is healthy (70%+).

## 5. Risks & Tradeoffs (Crucial)

### Risk 1: The "One-and-Done" Churn Risk
- **Problem:** A seller with 25 SKUs signs up for Growth, optimizes all 25 listings in month 1/2, and then cancels because their catalog is done. Listing optimization is often a one-time project per SKU.
- **Mitigation:** 
  1. Push users to annual billing (e.g. ₹4,999/yr for Growth, ₹14,999/yr for Pro).
  2. The POA generator in the Pro tier acts as "insurance" to keep them subscribed even if they aren't actively listing.

### Risk 2: Top-up vs. Upgrade Cannibalization
- **Problem:** If a Growth user needs 5 more credits, buying them at ₹49/credit costs ₹245. They might just do that instead of upgrading to Pro.
- **Recommendation:** This is actually fine, as ₹49/credit is higher margin than the subscription credit cost.

## 6. Execution Recommendations

1. **Test Annual Billing:** Offer annual plans with 2 months free to lock in revenue and mitigate the "one-and-done" churn risk mentioned above.
2. **Feature Gating:** Ensure that the Bulk Upload feature is *strictly* locked to the Agency tier, and POA is locked to Pro+, as these are the primary drivers for upgrading.
3. **Value Metric Monitoring:** Monitor how quickly users burn their credits. If heavy usage occurs, consider adjusting limits or promoting the add-on credits.
