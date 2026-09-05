# Fitplan Wallet — real payment architecture

## User flow (kept intentionally simple)

1. **Pay / Add Money** → user enters amount → Fitplan creates a one-time dynamic UPI QR through the payment provider → user scans with any UPI app → Fitplan credits the wallet only after a verified provider webhook.
2. **Withdraw** → user enters amount + UPI ID → backend reserves the wallet balance → approved payout provider sends the payout → payout webhook finalizes or reverses the wallet transaction.

There is no personal PhonePe QR and no manual "I paid" credit button.

## Provider setup required

- Razorpay merchant onboarding/KYC and Live API credentials for payment collection.
- Razorpay QR Code API access. Razorpay documents `upi_qr` dynamic QR creation and the `qr_code.credited` webhook.
- Public HTTPS webhook endpoint: `/api/webhooks/razorpay`.
- For withdrawals, an activated RazorpayX/approved payout setup and appropriate business/compliance arrangement. RazorpayX requires an account identifier, payout API access, and idempotency keys; payout status should be consumed via webhooks.

## Important compliance boundary

Code can implement provider APIs and a wallet ledger, but operating a withdrawable stored-value wallet for customers is a regulated financial use case in India. Complete the required legal/compliance/provider structure before accepting customer money into a withdrawable Fitplan balance.
