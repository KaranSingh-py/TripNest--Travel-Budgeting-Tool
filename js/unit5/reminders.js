/* UNIT V: TRIP PAYMENT REMINDERS */
document.addEventListener("DOMContentLoaded", function() {
    const user=AppStorage.getActiveUser();
    const list=document.getElementById("dashboardRemindersList");
    const form=document.getElementById("addReminderForm");
    if (!user || !list) return;
    function render() {
        const items=AppStorage.getUserRecords("tbt_reminders",user.id).sort(function(a,b){return a.date.localeCompare(b.date);});
        list.innerHTML=items.map(function(item){
            const overdue=item.date < new Date().toISOString().slice(0,10) && !item.done;
            return `<li class="checklist-row"><span>${item.title} — ${item.date} ${overdue?'<strong class="text-danger">OVERDUE</strong>':""}</span><button type="button" class="btn btn-xs btn-outline reminder-done" data-id="${item.id}">${item.done?"Done":"Mark done"}</button></li>`;
        }).join("") || "<li>No reminders yet.</li>";
    }
    form?.addEventListener("submit",function(event){
        event.preventDefault();
        const title=document.getElementById("newReminderTitle").value.trim(), date=document.getElementById("newReminderDate").value;
        if(!title||!date)return;
        const all=AppStorage.readRecords("tbt_reminders");
        all.push({id:"rem_"+Date.now(),userId:user.id,title:title,date:date,done:false});
        AppStorage.saveRecords("tbt_reminders",all); form.reset(); render();
    });
    list.addEventListener("click",function(event){
        const button=event.target.closest(".reminder-done"); if(!button)return;
        const all=AppStorage.readRecords("tbt_reminders"), item=all.find(function(x){return x.id===button.dataset.id&&x.userId===user.id;});
        if(item)item.done=!item.done; AppStorage.saveRecords("tbt_reminders",all);render();
    });
    render();
});
