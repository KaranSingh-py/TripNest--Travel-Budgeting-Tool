/* UNIT VI: REPORTS & CHARTS */
document.addEventListener("DOMContentLoaded", function() {
    if (document.body.dataset.page !== "reports") return;
    const activeUser = AppStorage.getActiveUser();
    if (!activeUser) return;
    
    const allExpenses = AppStorage.getUserRecords("tbt_expenses", activeUser.id);
    const allTrips = AppStorage.getUserRecords("tbt_trips", activeUser.id);

    function drawCategoryChart() {
        const box = document.getElementById("reportsCategoryChartBox");
        if (!box) return;
        
        let totals = {};
        let grandTotal = 0;
        allExpenses.forEach(e => { totals[e.category] = (totals[e.category] || 0) + Number(e.amount); grandTotal += Number(e.amount); });

        if (grandTotal === 0) { box.innerHTML = `<p class="text-muted text-center" style="margin-top:80px;">No expense data to chart.</p>`; return; }

        let svgHTML = `<svg viewBox="0 0 340 200" width="100%" height="200" role="img" aria-label="Bar chart of category spending">`;
        const colors = ["#8B5CF6", "#35A875", "#FBBF24", "#EF5350", "#60A5FA", "#A78BFA", "#2D3136"];
        let yPos = 20; let colorIndex = 0;

        for (const [category, amount] of Object.entries(totals)) {
            const percent = (amount / grandTotal) * 100;
            const barWidth = Math.max((percent / 100) * 220, 5);
            svgHTML += `
                <rect x="20" y="${yPos}" width="${barWidth}" height="22" rx="4" fill="${colors[colorIndex % colors.length]}"></rect>
                <text x="${20 + barWidth + 10}" y="${yPos + 16}" fill="currentColor" font-size="12">${category} (${Math.round(percent)}%)</text>
            `;
            yPos += 35; colorIndex++;
        }
        svgHTML += `</svg>`;
        box.innerHTML = svgHTML;
    }

    function populateCompareSelects() {
        const selA = document.getElementById("compareTripA");
        const selB = document.getElementById("compareTripB");
        if(!selA || !selB) return;
        allTrips.forEach(t => {
            selA.innerHTML += `<option value="${t.id}">${t.tripName}</option>`;
            selB.innerHTML += `<option value="${t.id}">${t.tripName}</option>`;
        });
    }

    function updateTripComparison() {
        const tripAId = document.getElementById("compareTripA")?.value;
        const tripBId = document.getElementById("compareTripB")?.value;
        const tbody = document.getElementById("tripComparisonTbody");
        const tripA = allTrips.find(t => t.id === tripAId);
        const tripB = allTrips.find(t => t.id === tripBId);

        if (!tripA || !tripB || !tbody) return;
        document.getElementById("compHeaderA").textContent = tripA.tripName;
        document.getElementById("compHeaderB").textContent = tripB.tripName;

        const getDays = (start, end) => Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1;
        const daysA = Math.max(1, getDays(tripA.startDate, tripA.endDate) || 1);
        const daysB = Math.max(1, getDays(tripB.startDate, tripB.endDate) || 1);
        const spentA = allExpenses.filter(e => e.tripId === tripA.id).reduce((s, e) => s + Number(e.amount), 0);
        const spentB = allExpenses.filter(e => e.tripId === tripB.id).reduce((s, e) => s + Number(e.amount), 0);

        tbody.innerHTML = `
            <tr><td><strong>Duration (Days)</strong></td><td>${daysA} Days</td><td>${daysB} Days</td><td class="text-muted">Diff: ${Math.abs(daysA - daysB)} Days</td></tr>
            <tr><td><strong>Total Budget</strong></td><td>$${(Number(tripA.totalBudget)||0).toFixed(2)}</td><td>$${(Number(tripB.totalBudget)||0).toFixed(2)}</td><td class="text-muted">Diff: $${Math.abs((Number(tripA.totalBudget)||0) - (Number(tripB.totalBudget)||0)).toFixed(2)}</td></tr>
            <tr><td><strong>Actual Spending</strong></td><td>$${spentA.toFixed(2)}</td><td>$${spentB.toFixed(2)}</td><td class="text-muted">Diff: $${Math.abs(spentA - spentB).toFixed(2)}</td></tr>
            <tr style="background-color: var(--bg-alt);"><td><strong>Average Spent / Day</strong></td><td>$${(spentA/daysA).toFixed(2)} / day</td><td>$${(spentB/daysB).toFixed(2)} / day</td><td>-</td></tr>
        `;
    }

    const form = document.getElementById("reportFilterForm");
    if (form) { form.addEventListener("submit", function(e) { e.preventDefault(); updateTripComparison(); }); }
    
    populateCompareSelects(); drawCategoryChart(); updateTripComparison();
});
