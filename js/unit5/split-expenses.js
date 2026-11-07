/* UNIT V: EXPENSE SPLITTING */
document.addEventListener("DOMContentLoaded", function() {
    const activeUser = AppStorage.getActiveUser();
    const urlParams = new URLSearchParams(window.location.search);
    const currentTripId = urlParams.get('id');
    if (!activeUser || !currentTripId) return;

    const splitTbody = document.getElementById("splitSummaryTbody");
    const travelersList = document.getElementById("detailTravelersList");
    const addTravelerForm = document.getElementById("addTravelerForm");

    let tripTravelers = AppStorage.readRecords(`tbt_travelers_${currentTripId}`);
    if (tripTravelers.length === 0) {
        tripTravelers = [activeUser.name]; 
        AppStorage.saveRecords(`tbt_travelers_${currentTripId}`, tripTravelers);
    }

    function renderTravelers() {
        if (!travelersList) return;
        travelersList.innerHTML = "";
        tripTravelers.forEach(t => {
            travelersList.innerHTML += `<li class="tag-item" style="list-style:none; background:var(--bg-alt); padding:4px 8px; border-radius:4px; border:1px solid var(--border-color);">${t} <button class="btn-xs del-traveler" data-name="${t}" style="background:none; border:none; color:var(--error); cursor:pointer;">x</button></li>`;
        });
        const expPaidBy = document.getElementById("expPaidBy");
        if (expPaidBy) {
            expPaidBy.innerHTML = "";
            tripTravelers.forEach(t => expPaidBy.innerHTML += `<option value="${t}">${t}</option>`);
        }
    }

    function calculateSettlement() {
        if (!splitTbody) return;
        const allExpenses = AppStorage.readRecords("tbt_expenses").filter(e => e.tripId === currentTripId);
        let paidTotals = {};
        tripTravelers.forEach(t => paidTotals[t] = 0);
        let totalTripCost = 0;
        
        allExpenses.forEach(exp => {
            if (exp.splitType !== "personal") {
                const amt = Number(exp.amount);
                totalTripCost += amt;
                const payer = exp.paidBy || activeUser.name;
                if (paidTotals[payer] !== undefined) { paidTotals[payer] += amt; } 
                else { paidTotals[payer] = amt; }
            }
        });

        const share = totalTripCost / tripTravelers.length || 0;
        splitTbody.innerHTML = "";
        tripTravelers.forEach(t => {
            const paid = paidTotals[t] || 0;
            const balance = paid - share;
            let balanceHtml = balance > 0.01 ? `<td class="text-success">Owed +$${balance.toFixed(2)}</td>` : (balance < -0.01 ? `<td class="text-danger">Owes -$${Math.abs(balance).toFixed(2)}</td>` : `<td>Settled</td>`);
            splitTbody.innerHTML += `<tr><td>${t}</td><td>$${paid.toFixed(2)}</td><td>$${share.toFixed(2)}</td>${balanceHtml}</tr>`;
        });
    }

    if (addTravelerForm) {
        addTravelerForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const name = document.getElementById("newTravelerName").value.trim();
            if (name && !tripTravelers.includes(name)) {
                tripTravelers.push(name);
                AppStorage.saveRecords(`tbt_travelers_${currentTripId}`, tripTravelers);
                renderTravelers(); calculateSettlement(); addTravelerForm.reset();
            }
        });
    }

    if (travelersList) {
        travelersList.addEventListener("click", function(e) {
            if (e.target.classList.contains("del-traveler")) {
                const name = e.target.getAttribute("data-name");
                if (name === activeUser.name) return alert("Cannot remove the primary trip owner.");
                tripTravelers = tripTravelers.filter(t => t !== name);
                AppStorage.saveRecords(`tbt_travelers_${currentTripId}`, tripTravelers);
                renderTravelers(); calculateSettlement();
            }
        });
    }

    renderTravelers(); calculateSettlement();
});
