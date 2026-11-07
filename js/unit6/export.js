/* UNIT VI: CLIENT-SIDE CSV AND PRINT EXPORTS */
function tripNestDownloadCSV(filename, rows) {
    const csv = rows.map(function(row) {
        return row.map(function(value) {
            const text = String(value == null ? "" : value).replace(/"/g, '""');
            return '"' + text + '"';
        }).join(",");
    }).join("\r\n");
    const blob = new Blob(["\uFEFF" + csv], {type:"text/csv;charset=utf-8;"});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = filename; document.body.appendChild(link); link.click();
    link.remove(); URL.revokeObjectURL(url);
}
document.addEventListener("DOMContentLoaded", function() {
    const buttons = document.querySelectorAll("[data-export-expenses]");
    buttons.forEach(function(button) {
        button.addEventListener("click", function() {
            const user = AppStorage.getActiveUser();
            if (!user) return;
            const expenses = AppStorage.getUserRecords("tbt_expenses", user.id);
            const rows = [["Date","Trip ID","Title","Category","Amount","Currency","Payment Method","Paid By"]];
            expenses.forEach(function(e) { rows.push([e.date,e.tripId,e.title,e.category,e.amount,e.currency,e.paymentMethod,e.paidBy]); });
            tripNestDownloadCSV("tripnest-expenses.csv", rows);
        });
    });
    document.querySelectorAll("[data-print-page]").forEach(function(button) {
        button.addEventListener("click", function() { window.print(); });
    });
});
