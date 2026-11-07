/* UNIT V: CHECKLIST & PACKING */
document.addEventListener("DOMContentLoaded", function() {
    const urlParams = new URLSearchParams(window.location.search);
    const currentTripId = urlParams.get('id');
    if (!currentTripId) return;

    function renderChecklist(type, ulId, badgeId, recordKey, formId, titleId, valId, catId = null) {
        const ul = document.getElementById(ulId);
        const form = document.getElementById(formId);
        if (!ul) return;

        function draw() {
            let items = AppStorage.readRecords(recordKey).filter(c => c.tripId === currentTripId);
            ul.innerHTML = "";
            if (items.length === 0) {
                ul.innerHTML = `<li class="text-muted" style="list-style:none;">List is empty.</li>`;
                if(document.getElementById(badgeId)) document.getElementById(badgeId).textContent = "0";
                return;
            }

            let compCount = 0;
            items.forEach(item => {
                const isDone = type === 'pay' ? item.isPaid : item.isPacked;
                if (isDone) compCount++;
                const textClass = isDone ? "completed-text" : "";
                const lbl = type === 'pay' ? `${item.title} ($${item.amountDue})` : `[${item.category}] ${item.name}`;
                ul.innerHTML += `
                    <li class="checklist-row">
                        <input type="checkbox" class="chk-toggle" data-id="${item.id}" ${isDone ? 'checked' : ''}>
                        <label class="${textClass}">${lbl}</label>
                        <button type="button" class="btn btn-outline btn-xs del-chk" data-id="${item.id}" style="margin-left:auto;">x</button>
                    </li>
                `;
            });
            const badgeText = type === 'pay' ? `${compCount}/${items.length} Paid` : `${Math.round((compCount/items.length)*100)}% Packed`;
            if(document.getElementById(badgeId)) document.getElementById(badgeId).textContent = badgeText;
        }

        if (form) {
            form.addEventListener("submit", function(e) {
                e.preventDefault();
                let items = AppStorage.readRecords(recordKey);
                if (type === 'pay') {
                    items.push({ id: "pay_" + Date.now(), tripId: currentTripId, title: document.getElementById(titleId).value, amountDue: parseFloat(document.getElementById(valId).value) || 0, isPaid: false });
                } else {
                    items.push({ id: "pack_" + Date.now(), tripId: currentTripId, name: document.getElementById(titleId).value, category: document.getElementById(catId).value, isPacked: false });
                }
                AppStorage.saveRecords(recordKey, items);
                form.reset(); draw();
            });
        }

        ul.addEventListener("click", function(e) {
            const id = e.target.getAttribute("data-id");
            if (!id) return;
            let items = AppStorage.readRecords(recordKey);
            if (e.target.classList.contains("del-chk")) {
                items = items.filter(c => c.id !== id);
            } else if (e.target.classList.contains("chk-toggle")) {
                const item = items.find(c => c.id === id);
                if (item) { if (type === 'pay') item.isPaid = e.target.checked; else item.isPacked = e.target.checked; }
            }
            AppStorage.saveRecords(recordKey, items); draw();
        });
        draw();
    }

    renderChecklist('pay', 'paymentChecklistUl', 'paymentChecklistBadge', 'tbt_checklists', 'addPaymentChecklistForm', 'newChecklistTitle', 'newChecklistAmount');
    renderChecklist('pack', 'packingListUl', 'packingProgressBadge', 'tbt_packing', 'addPackingItemForm', 'newPackingName', null, 'newPackingCategory');
});
