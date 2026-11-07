/* UNIT VI: DASHBOARD */
document.addEventListener("DOMContentLoaded", function() {
    if (document.body.dataset.page !== "dashboard") return;
    const activeUser = AppStorage.getActiveUser();
    if (!activeUser) return;

    const allTrips = AppStorage.getUserRecords("tbt_trips", activeUser.id);
    const allExpenses = AppStorage.getUserRecords("tbt_expenses", activeUser.id);

    function renderDashboardKPIs() {
        let totalBudget = 0;
        let activeTripCount = 0;
        allTrips.forEach(t => { if (t.status !== "archived") { totalBudget += t.totalBudget; activeTripCount++; } });
        const totalSpent = allExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
        
        document.getElementById("kpiTotalTrips").textContent = activeTripCount;
        document.getElementById("kpiTotalBudget").textContent = `${activeUser.homeCurrency} ${totalBudget.toFixed(2)}`;
        document.getElementById("kpiTotalSpent").textContent = `${activeUser.homeCurrency} ${totalSpent.toFixed(2)}`;
        document.getElementById("kpiRemainingBudget").textContent = `${activeUser.homeCurrency} ${(totalBudget - totalSpent).toFixed(2)}`;
        
        const spendPercent = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
        document.getElementById("kpiSpentPercent").textContent = `${spendPercent.toFixed(1)}% utilized`;
    }

    function renderDashboardTrips() {
        const list = document.getElementById("dashboardTripsList");
        if (!list) return;
        const visibleTrips = allTrips.filter(t => t.status !== "archived").slice(0, 3);
        list.innerHTML = "";
        visibleTrips.forEach(trip => {
            const exp = allExpenses.filter(e => e.tripId === trip.id).reduce((s, e) => s + Number(e.amount), 0);
            list.innerHTML += `<article class="list-item-card">
                <div><h3><a href="./trip-details.html?id=${trip.id}">${trip.tripName}</a></h3><p class="text-muted">${trip.startDate} | ${trip.currency}</p></div>
                <div class="list-item-meta"><span class="badge badge-info">${trip.status}</span><strong>$${exp.toFixed(0)} / $${trip.totalBudget.toFixed(0)}</strong></div>
            </article>`;
        });
    }

    function renderDashboardExpenses() {
        const tbody = document.getElementById("dashboardExpensesTbody");
        if (!tbody) return;
        const recentExp = [...allExpenses].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
        tbody.innerHTML = "";
        recentExp.forEach(exp => {
            tbody.innerHTML += `<tr><td>${exp.date}</td><td>${exp.title}</td><td><span class="badge badge-surface" style="border:1px solid var(--border-color)">${exp.category}</span></td><td><strong>${exp.currency} ${Number(exp.amount).toFixed(2)}</strong></td></tr>`;
        });
    }
    
    renderDashboardKPIs(); renderDashboardTrips(); renderDashboardExpenses();
});
