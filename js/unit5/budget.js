/* UNIT V: BUDGET INTELLIGENCE */
const BudgetManager = {
    categories: ["Flights", "Accommodation", "Food", "Local transportation", "Activities and sightseeing", "Shopping", "Miscellaneous"],
    getAllocations: function(tripId) {
        const tripAllocations = AppStorage.readRecords("tbt_allocations");
        let tripAlloc = tripAllocations.find(a => a.tripId === tripId);
        if (!tripAlloc) {
            tripAlloc = { tripId: tripId, categories: {} };
            this.categories.forEach(cat => tripAlloc.categories[cat] = 0);
            tripAllocations.push(tripAlloc);
            AppStorage.saveRecords("tbt_allocations", tripAllocations);
        }
        return tripAlloc;
    },
    saveAllocations: function(tripAlloc) {
        let allAllocs = AppStorage.readRecords("tbt_allocations");
        const index = allAllocs.findIndex(a => a.tripId === tripAlloc.tripId);
        if (index > -1) { allAllocs[index] = tripAlloc; } else { allAllocs.push(tripAlloc); }
        AppStorage.saveRecords("tbt_allocations", allAllocs);
    },
    calculateBudgetMetrics: function(tripId) {
        const activeUser = AppStorage.getActiveUser();
        if (!activeUser) return null;
        const allTrips = AppStorage.getUserRecords("tbt_trips", activeUser.id);
        const trip = allTrips.find(t => t.id === tripId);
        if (!trip) return null;

        const totalBudget = Number(trip.totalBudget) || 0;
        const requestedBuffer = Number(trip.contingencyPercent || (activeUser.preferences && activeUser.preferences.contingencyPercent) || 10);
        const contingencyPercent = Math.min(15, Math.max(5, Number.isFinite(requestedBuffer) ? requestedBuffer : 10));
        const contingencyBuffer = (totalBudget * contingencyPercent) / 100;
        const usableBudget = totalBudget - contingencyBuffer;

        const allocations = this.getAllocations(tripId);
        let totalAllocated = 0;
        for (let cat in allocations.categories) { totalAllocated += Number(allocations.categories[cat]) || 0; }

        const tripExpenses = AppStorage.readRecords("tbt_expenses").filter(e => e.tripId === tripId);
        let totalSpent = 0;
        let spentByCategory = {};
        this.categories.forEach(cat => spentByCategory[cat] = 0);

        tripExpenses.forEach(exp => {
            const amount = Number(exp.amount);
            if (Number.isFinite(amount) && amount > 0) {
                totalSpent += amount;
                if (spentByCategory[exp.category] !== undefined) { spentByCategory[exp.category] += amount; }
            }
        });

        return {
            trip: trip, totalBudget: totalBudget, contingencyPercent: contingencyPercent, contingencyBuffer: contingencyBuffer,
            usableBudget: usableBudget, totalAllocated: totalAllocated, unallocated: usableBudget - totalAllocated,
            totalSpent: totalSpent, spentByCategory: spentByCategory, allocations: allocations.categories,
            remaining: totalBudget - totalSpent, spendableRemaining: usableBudget - totalSpent, spentPercent: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
        };
    },
    calculateDailyLimit: function(tripId) {
        const metrics = this.calculateBudgetMetrics(tripId);
        if (!metrics) return 0;
        const trip = metrics.trip;
        const todayStr = new Date().toISOString().split('T')[0];
        let daysRemaining = 0;
        if (todayStr > trip.endDate) { return 0; } 
        else if (todayStr < trip.startDate) {
            daysRemaining = Math.ceil((new Date(trip.endDate) - new Date(trip.startDate)) / (1000 * 60 * 60 * 24)) + 1;
        } else {
            daysRemaining = Math.ceil((new Date(trip.endDate) - new Date(todayStr)) / (1000 * 60 * 60 * 24)) + 1;
        }
        if (daysRemaining <= 0 || metrics.spendableRemaining <= 0) return 0;
        return metrics.spendableRemaining / daysRemaining;
    },
    renderBudgetBreakdown: function(tripId) {
        const metrics = this.calculateBudgetMetrics(tripId);
        const tbody = document.getElementById("categoryBudgetTbody");
        if (!tbody || !metrics) return;
        tbody.innerHTML = "";
        
        let statusOverall = "safe";
        if (metrics.totalSpent >= metrics.totalBudget) statusOverall = "danger";
        else if (metrics.totalSpent >= metrics.totalBudget * 0.75) statusOverall = "warning";

        this.categories.forEach(cat => {
            const allocated = Number(metrics.allocations[cat]) || 0;
            const spent = metrics.spentByCategory[cat] || 0;
            const variance = allocated - spent;
            let percentUsed = allocated > 0 ? (spent / allocated) * 100 : (spent > 0 ? 100 : 0);
            
            let statusClass = "status-safe";
            let textClass = "text-success";
            if (percentUsed >= 100) { statusClass = "status-danger"; textClass = "text-danger"; } 
            else if (percentUsed >= 75) { statusClass = "status-warning"; textClass = "text-warning"; }
            
            tbody.innerHTML += `<tr>
                <td><strong>${cat}</strong></td>
                <td>${metrics.trip.currency} ${allocated.toFixed(2)}</td>
                <td>${metrics.trip.currency} ${spent.toFixed(2)}</td>
                <td class="${textClass}">${variance >= 0 ? '+' : ''}${metrics.trip.currency} ${variance.toFixed(2)}</td>
                <td><div class="progress-track" role="progressbar"><div class="progress-fill ${statusClass}" style="width: ${Math.min(percentUsed, 100)}%;"></div></div></td>
            </tr>`;
        });

        if (document.getElementById("detailTotalBudget")) document.getElementById("detailTotalBudget").textContent = `${metrics.trip.currency} ${metrics.totalBudget.toFixed(2)}`;
        if (document.getElementById("detailContingencyText")) document.getElementById("detailContingencyText").textContent = `Contingency: ${metrics.trip.currency} ${metrics.contingencyBuffer.toFixed(2)}`;
        if (document.getElementById("detailTotalSpent")) document.getElementById("detailTotalSpent").textContent = `${metrics.trip.currency} ${metrics.totalSpent.toFixed(2)}`;
        if (document.getElementById("detailRemaining")) document.getElementById("detailRemaining").textContent = `${metrics.trip.currency} ${metrics.remaining.toFixed(2)}`;
        if (document.getElementById("detailDailyLimit")) document.getElementById("detailDailyLimit").textContent = `${metrics.trip.currency} ${this.calculateDailyLimit(tripId).toFixed(2)} / day`;
        
        const alertBox = document.getElementById("detailBudgetAlert");
        if (alertBox) {
            if (statusOverall === "danger") {
                alertBox.className = "alert alert-danger"; alertBox.innerHTML = `<strong>Overspending Alert:</strong> Expenses have exceeded limit.`; alertBox.classList.remove("hidden");
            } else if (statusOverall === "warning") {
                alertBox.className = "alert alert-warning"; alertBox.innerHTML = `<strong>Budget Warning:</strong> Reached 75% of the total budget.`; alertBox.classList.remove("hidden");
            } else { alertBox.classList.add("hidden"); }
        }
    }
};

document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const currentTripId = urlParams.get('id');
    if (!currentTripId) return;

    const updateAllocForm = document.getElementById("updateCategoryBudgetForm");
    if (updateAllocForm) {
        updateAllocForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const category = document.getElementById("allocCategorySelect").value;
            const amount = parseFloat(document.getElementById("allocAmountInput").value);
            if (!Number.isFinite(amount) || amount < 0) { alert("Invalid amount."); return; }

            const metrics = BudgetManager.calculateBudgetMetrics(currentTripId);
            const currentAlloc = metrics.allocations[category];
            const netDifference = amount - currentAlloc;
            if (netDifference > metrics.unallocated) {
                alert(`Cannot allocate ${amount}. Only ${metrics.unallocated.toFixed(2)} remains unallocated.`);
                return;
            }
            const allocRecord = BudgetManager.getAllocations(currentTripId);
            allocRecord.categories[category] = amount;
            BudgetManager.saveAllocations(allocRecord);
            updateAllocForm.reset();
            BudgetManager.renderBudgetBreakdown(currentTripId);
        });
    }
    BudgetManager.renderBudgetBreakdown(currentTripId);
});
