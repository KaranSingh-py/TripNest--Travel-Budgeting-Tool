/* UNIT V: EXPENSES */
document.addEventListener("DOMContentLoaded", function() {
    const activeUser = AppStorage.getActiveUser();
    const urlParams = new URLSearchParams(window.location.search);
    const currentTripId = urlParams.get('id');
    if (!activeUser || !currentTripId) return;

    const expenseForm = document.getElementById("expenseForm");
    const expensesTbody = document.getElementById("expensesTbody");

    function renderExpenses() {
        if (!expensesTbody) return;
        let tripExpenses = AppStorage.readRecords("tbt_expenses").filter(e => e.tripId === currentTripId);
        tripExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        expensesTbody.innerHTML = "";
        
        if (tripExpenses.length === 0) {
            expensesTbody.innerHTML = `<tr><td colspan="8" class="text-muted text-center">No expenses logged.</td></tr>`;
            return;
        }
        tripExpenses.forEach(exp => {
            expensesTbody.innerHTML += `<tr>
                <td>${exp.date}</td>
                <td><strong>${exp.title}</strong></td>
                <td><span class="badge badge-info">${exp.category}</span></td>
                <td>${exp.paidBy || activeUser.name}</td>
                <td>${exp.currency} ${Number(exp.amount).toFixed(2)}</td>
                <td><strong>${formatCurrency(exp.amount, exp.currency || "INR")}</strong></td>
                <td><span class="text-muted">None</span></td>
                <td><button class="btn btn-outline btn-xs action-edit-exp" data-id="${exp.id}">Edit</button> <button class="btn btn-danger btn-xs action-delete-exp" data-id="${exp.id}">Del</button></td>
            </tr>`;
        });
        if (typeof BudgetManager !== "undefined") BudgetManager.renderBudgetBreakdown(currentTripId);
    }

    if (expenseForm) {
        expenseForm.addEventListener("submit", function(e) {
            e.preventDefault();
            const expIdInput = document.getElementById("expenseIdInput").value;
            const title = document.getElementById("expTitle").value.trim();
            const category = document.getElementById("expCategory").value;
            const date = document.getElementById("expDate").value;
            const amount = parseFloat(document.getElementById("expAmount").value);
            const currency = document.getElementById("expCurrency").value;
            const paymentMethod = document.getElementById("expPaymentMethod").value;
            const paidBy = document.getElementById("expPaidBy") ? document.getElementById("expPaidBy").value : activeUser.name;

            if (title.length < 2 || !Number.isFinite(amount) || amount <= 0 || !date || Number.isNaN(new Date(date).getTime())) return alert("Enter a valid description, date and positive amount.");

            const expId = expIdInput ? expIdInput : "exp_" + Date.now();
            const expenseRecord = { id: expId, tripId: currentTripId, userId: activeUser.id, title: title, category: category, date: date, amount: amount, currency: currency, paymentMethod: paymentMethod, paidBy: paidBy, splitType: "equal" };

            let allExpenses = AppStorage.readRecords("tbt_expenses");
            const index = allExpenses.findIndex(e => e.id === expId);
            if (index > -1) allExpenses[index] = expenseRecord;
            else allExpenses.push(expenseRecord);

            AppStorage.saveRecords("tbt_expenses", allExpenses);
            expenseForm.reset(); document.getElementById("expenseIdInput").value = "";
            renderExpenses();
        });
    }

    const expensesTable = document.getElementById("expensesTable");
    if (expensesTable) {
        expensesTable.addEventListener("click", function(e) {
            const expId = e.target.getAttribute("data-id");
            if (!expId) return;
            let allExpenses = AppStorage.readRecords("tbt_expenses");
            if (e.target.classList.contains("action-delete-exp")) {
                if (confirm("Delete this expense?")) {
                    AppStorage.saveRecords("tbt_expenses", allExpenses.filter(exp => exp.id !== expId));
                    renderExpenses();
                }
            } else if (e.target.classList.contains("action-edit-exp")) {
                const exp = allExpenses.find(e => e.id === expId && e.userId === activeUser.id && e.tripId === currentTripId);
                if (exp) {
                    document.getElementById("expenseIdInput").value = exp.id;
                    document.getElementById("expTitle").value = exp.title;
                    document.getElementById("expCategory").value = exp.category;
                    document.getElementById("expDate").value = exp.date;
                    document.getElementById("expAmount").value = exp.amount;
                    document.getElementById("expCurrency").value = exp.currency || "INR";
                    document.getElementById("expPaymentMethod").value = exp.paymentMethod || "Other";
                    if(document.getElementById("expPaidBy")) document.getElementById("expPaidBy").value = exp.paidBy;
                    window.scrollTo(0, document.getElementById("expenseForm").offsetTop - 100);
                }
            }
        });
    }
    renderExpenses();
});
