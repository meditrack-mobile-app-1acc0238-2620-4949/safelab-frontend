import fs from 'node:fs';
const d=JSON.parse(fs.readFileSync('server/db.json','utf8'));
const exists=(arr,id)=>arr.some(x=>x.id===id);let assertions=0;
const check=(condition, msg)=>{assertions++;if(!condition)throw new Error(msg)};
check(d.users.length===1,'only administrator active mock');check(d.sensors.length===12,'12 sensors');check(d.assets.length===10,'10 assets');
for(const s of d.sensors){check(exists(d.assets,s.assetId),`sensor ${s.id} asset`);check(exists(d.facilities,s.facilityId),`sensor ${s.id} facility`)}
for(const a of d.alerts){check(exists(d.sensors,a.sensorId),`${a.id} sensor`);check(exists(d.assets,a.assetId),`${a.id} asset`)}
for(const i of d.incidents){check(exists(d.alerts,i.relatedAlertId),`${i.code} alert`);check(exists(d.sensors,i.relatedSensorId),`${i.code} sensor`);check(exists(d.assets,i.relatedAssetId),`${i.code} asset`)}
for(const e of d.complianceEvaluations){check(d.complianceRules.some(x=>x.id===e.ruleId),`${e.id} rule`);check(exists(d.sensors,e.sensorId),`${e.id} sensor`)}
for(const v of d.complianceViolations){check(d.complianceEvaluations.some(x=>x.id===v.evaluationId),`${v.id} eval`);if(v.incidentCode)check(d.incidents.some(i=>i.code===v.incidentCode),`${v.id} incident`)}
for(const m of d.maintenanceRecords){check(exists(d.assets,m.equipmentId),`${m.id} equipment`)}
for(const a of d.actuators){if(a.assetId)check(exists(d.assets,a.assetId),`${a.id} asset`);check(exists(d.facilities,a.facilityId),`${a.id} facility`)}
for(const command of d.remoteCommands)check(exists(d.actuators,command.actuatorId),`${command.id} actuator`);
check(d.sensors.filter(x=>x.connection==='online').length===9,'9 active sensors');check(d.sensors.filter(x=>x.connection==='offline').length===2,'2 disconnected');check(d.sensors.filter(x=>x.connection==='maintenance').length===1,'1 maintenance');
check(d.billing.accountId===d.users[0].id,'billing IAM identity');check(d.users[0].email==='admin@hotmail.com','admin email');check(d.users[0].username.length===18,'admin username');
check(d.billing.invoices.length===5,'5 invoices');for(const rec of d.billing.invoices)check(rec.amount===rec.subtotal+rec.tax,'receipt math');
console.log(`PASS ${assertions} cross-context data checks`);
