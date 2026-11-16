(function(root){
  function estimate(x){
    const value=k=>{const n=Number(x[k]??0);if(!Number.isFinite(n)||n<0)throw Error('Invalid non-negative input: '+k);return n;};
    const hours=value('hours'),days=value('days');if(hours>24||days>31)throw Error('Invalid monthly schedule');
    const compute=hours*days*value('cu')*value('computeRate');
    const database=value('databaseGB')*value('databaseRate');
    const objects=value('objectGB')*value('objectRate');
    const history=value('historyGB')*value('historyRate');
    const network=Math.max(0,value('egressGB')-value('includedEgressGB'))*value('egressRate');
    const other=value('other');const total=compute+database+objects+history+network+other;
    const saving=value('existingBill')-total,migration=value('migrationCost');
    return {awakeHours:hours*days,compute,database,objects,history,network,other,total,saving,breakEvenMonths:saving>0&&migration>0?migration/saving:null};
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={estimate};else root.NeonCost={estimate};
})(typeof globalThis!=='undefined'?globalThis:this);
