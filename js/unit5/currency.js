/* UNIT V: MULTI-CURRENCY CONVERTER */
document.addEventListener("DOMContentLoaded", function() {
    const currencyForm = document.getElementById("dashboardCurrencyForm");
    const demoRates = { "USD": 1.0, "INR": 84.10, "EUR": 0.92, "GBP": 0.79, "AED": 3.67, "THB": 33.80, "JPY": 152.40, "SGD": 1.34, "AUD": 1.51 };

    if (currencyForm) {
        currencyForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const amount = parseFloat(document.getElementById("convAmount").value);
            const fromCode = document.getElementById("convFrom").value;
            const toCode = document.getElementById("convTo").value;
            const outputEl = document.getElementById("convResultOutput");

            if (isNaN(amount) || amount <= 0) return;
            const amountInUsd = amount / demoRates[fromCode];
            const finalAmount = amountInUsd * demoRates[toCode];

            outputEl.innerHTML = `${amount.toFixed(2)} ${fromCode} = <strong>${finalAmount.toFixed(2)} ${toCode}</strong><br><small class="text-muted">*Demonstration rates only.</small>`;
        });
    }
});
