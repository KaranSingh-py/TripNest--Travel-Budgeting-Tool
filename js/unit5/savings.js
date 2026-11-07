/* UNIT V: TRIP SAVINGS GOALS */
document.addEventListener("DOMContentLoaded", function() {
    const user=AppStorage.getActiveUser(), form=document.getElementById("createSavingsGoalForm"), list=document.getElementById("savingsGoalsList");
    if(!user||!list)return;
    function render(){
        const goals=AppStorage.getUserRecords("tbt_savings",user.id);
        list.innerHTML=goals.map(function(g){
            const pct=g.target>0?Math.min(100,g.saved/g.target*100):0;
            return `<article class="list-item-card"><div><strong>${g.name}</strong><p>${g.currency} ${g.saved.toFixed(2)} of ${g.target.toFixed(2)} · Due ${g.deadline}</p><div class="progress-track"><div class="progress-fill status-safe" style="width:${pct}%"></div></div></div><span>${pct.toFixed(0)}%</span></article>`;
        }).join("")||"<p>No savings goals yet.</p>";
    }
    form?.addEventListener("submit",function(event){
        event.preventDefault();
        const name=document.getElementById("savGoalName").value.trim(),target=Number(document.getElementById("savTargetAmt").value),saved=Number(document.getElementById("savInitialAmt").value),deadline=document.getElementById("savDeadline").value;
        if(!name||!Number.isFinite(target)||!Number.isFinite(saved)||target<=0||saved<0||saved>target||!deadline)return alert("Enter valid savings goal values.");
        const all=AppStorage.readRecords("tbt_savings");all.push({id:"sav_"+Date.now(),userId:user.id,name:name,target:target,saved:saved,deadline:deadline,currency:user.homeCurrency||"INR"});
        AppStorage.saveRecords("tbt_savings",all);form.reset();render();
    });
    render();
});
