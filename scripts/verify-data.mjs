import fs from 'node:fs'
import { PERMISSION_GROUPS, ROLE_DEFAULTS, ROLE_GRANTABLE, effectivePermissions, CONTEXT_PERMISSION } from '../src/boundedcontext/identityaccess/domain/models/permission-catalog.js'
const data=JSON.parse(fs.readFileSync('server/db.json','utf8'))
let count=0
const test=(condition,message)=>{count++;if(!condition)throw new Error(message)}
const find=(key,id)=>data[key].find(r=>r.id===id)
const org=organizationId=>find('organizations',organizationId)
const inOrg=(key,organizationId)=>data[key].filter(row=>row.organizationId===organizationId)
const rolesFor={laboratory:new Set(['bioclinicalCoordinator','labTechnician','complianceOfficer','maintenanceOperator']),pharmaceutical:new Set(['pharmaOperationsCoordinator','pharmaTechnician','complianceOfficer','maintenanceOperator'])}
const permissions=PERMISSION_GROUPS.flatMap(g=>g.permissions)
test(data.organizations.length===3,'3 organizations')
test(data.users.length===19,'platform + 3 general managers + 15 employees')
test(permissions.length===21&&new Set(permissions).size===21,'21 unique permissions')
test(data.users.filter(u=>u.role==='platformAdmin').length===1,'one platform administrator')
test(data.users.find(u=>u.role==='platformAdmin')?.email==='admin@safelab.test','platform admin email matches local credentials')
test(new Set(data.users.map(u=>u.email)).size===data.users.length,'unique email')
test(new Set(data.users.map(u=>u.username)).size===data.users.length,'unique username')
test(new Set(data.users.map(u=>u.id)).size===data.users.length,'unique identity ids')
for(const user of data.users){
 test(/^\d{18}$/.test(user.username),`${user.fullName} numeric username`)
 if(user.role==='platformAdmin')continue
 test(Boolean(org(user.organizationId)),`${user.fullName} tenant exists`)
 if(user.role==='organizationAdmin')test(org(user.organizationId).managerId===user.id,`${user.fullName} is manager`)
 else test(rolesFor[org(user.organizationId).segment].has(user.role),`${user.fullName} role fits segment`)
 test(user.facilityIds.every(id=>find('facilities',id)?.organizationId===user.organizationId),`${user.fullName} facility permissions`)
 test((user.resourceIds||[]).every(id=>find('assets',id)?.organizationId===user.organizationId||find('sensors',id)?.organizationId===user.organizationId),`${user.fullName} equipment permissions`)
 const effective=effectivePermissions(user,data.permissionOverrides[user.id])
 test(effective.every(p=>['organizationAdmin'].includes(user.role)||ROLE_GRANTABLE[user.role].includes(p)),`${user.role} allowed permissions`)
}
for(const company of data.organizations){
 test(Boolean(find('users',company.managerId)),`${company.name} manager exists`)
 const subscription=data.subscriptions.find(s=>s.organizationId===company.id)
 test(Boolean(subscription)&&subscription.includedSeats===10,`${company.name} subscription and 10 seats`)
 const staff=inOrg('users',company.id).filter(u=>u.role!=='organizationAdmin' && u.status==='active')
 test(staff.length<=subscription.includedSeats+subscription.additionalSeats,`${company.name} seats`)
 test(subscription.invoices.length===5,`${company.name} invoices`)
 for(const receipt of subscription.invoices)test(Math.abs(receipt.amount-receipt.subtotal-receipt.tax)<0.02,`${receipt.id} subtotal+tax`)
}
for(const f of data.facilities)test(Boolean(org(f.organizationId)),`${f.id} tenant`)
for(const asset of data.assets){test(find('facilities',asset.facilityId)?.organizationId===asset.organizationId,`${asset.id} belongs to facility tenant`)}
for(const sensor of data.sensors){
 test(find('assets',sensor.assetId)?.organizationId===sensor.organizationId,`${sensor.id} asset tenant`)
 test(find('facilities',sensor.facilityId)?.organizationId===sensor.organizationId,`${sensor.id} facility tenant`)
}
for(const alert of data.alerts){test(find('sensors',alert.sensorId)?.organizationId===alert.organizationId,`${alert.id} sensor tenant`);test(find('assets',alert.assetId)?.organizationId===alert.organizationId,`${alert.id} asset tenant`)}
for(const inc of data.incidents){test(find('alerts',inc.relatedAlertId)?.organizationId===inc.organizationId,`${inc.id} alert tenant`);test(find('sensors',inc.relatedSensorId)?.organizationId===inc.organizationId,`${inc.id} sensor tenant`)}
for(const rule of data.complianceRules)test(find('sensors',rule.sensorId)?.organizationId===rule.organizationId,`${rule.id} sensor tenant`)
for(const e of data.complianceEvaluations){test(find('complianceRules',e.ruleId)?.organizationId===e.organizationId,`${e.id} rule tenant`);test(find('sensors',e.sensorId)?.organizationId===e.organizationId,`${e.id} sensor tenant`)}
for(const v of data.complianceViolations){test(find('complianceEvaluations',v.evaluationId)?.organizationId===v.organizationId,`${v.id} evaluation tenant`);if(v.incidentCode)test(data.incidents.some(i=>i.code===v.incidentCode&&i.organizationId===v.organizationId),`${v.id} incident tenant`)}
for(const m of data.maintenanceRecords)test(find('assets',m.equipmentId)?.organizationId===m.organizationId,`${m.id} maintenance tenant`)
for(const a of data.actuators){test(find('facilities',a.facilityId)?.organizationId===a.organizationId,`${a.id} facility tenant`);if(a.assetId)test(find('assets',a.assetId)?.organizationId===a.organizationId,`${a.id} equipment tenant`)}
for(const cmd of data.remoteCommands)test(find('actuators',cmd.actuatorId)?.organizationId===cmd.organizationId,`${cmd.id} actuator tenant`)
for(const key of ['reports','auditLogs','notifications'])for(const row of data[key])test(Boolean(org(row.organizationId)),`${key}/${row.id} organization`)
for(const [k,v] of Object.entries(CONTEXT_PERMISSION))test(Boolean(v),`context ${k} permission`)
console.log(`PASS ${count} multi-tenant, subscription, RBAC and cross-BC assertions`)
