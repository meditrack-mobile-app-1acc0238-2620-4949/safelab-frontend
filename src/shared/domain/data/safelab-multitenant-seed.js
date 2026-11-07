import { initialSafeLabData } from './safelab-demo-seed.js'
import { ADMIN_ID, ADMIN_USERNAME, ADMIN_EMAIL, ADMIN_PASSWORD } from '../../../boundedcontext/identityaccess/domain/models/mock-identity.js'

// Reproducible fictional companies and accounts for the two frontend clients.
// Keep stable ids so future backend contracts can use organizationId throughout.
const clone = value => JSON.parse(JSON.stringify(value))
const data = clone(initialSafeLabData)
const orgs = [
  {id:'org-andes', name:'Laboratorios Andinos S.A.C.', ruc:'20604567891', segment:'laboratory', corporateEmail:'contacto@andinos.example', city:'Huancayo', status:'active', managerId:'00000000-0000-4000-8000-000000000001', facilityIds:['fac-central','fac-north']},
  {id:'org-gabriel', name:'Centro Clínico San Gabriel S.A.C.', ruc:'20607891231', segment:'laboratory', corporateEmail:'gerencia@sangabriel.example', city:'Trujillo', status:'active', managerId:'00000000-0000-4000-8000-000000000002', facilityIds:['fac-hospital']},
  {id:'org-farma', name:'Farmacéutica Andina S.A.C.', ruc:'20601234565', segment:'pharmaceutical', corporateEmail:'administracion@farmaandina.example', city:'Arequipa', status:'active', managerId:'00000000-0000-4000-8000-000000000003', facilityIds:['fac-pharma']}
]
const O = [
  {id:'org-andes',short:'andes',name:'Valeria Chávez',manager:'Valeria Chávez',staff:[['Carlos Mendoza','bioclinicalCoordinator'],['Andrea Torres','labTechnician'],['Patricia Rivas','labTechnician'],['Ana Salazar','complianceOfficer'],['José Ramírez','maintenanceOperator']]},
  {id:'org-gabriel',short:'gabriel',name:'Lucía Benites',manager:'Lucía Benites',staff:[['Rosa Fernández','bioclinicalCoordinator'],['Gabriel Paredes','labTechnician'],['Diana Soto','labTechnician'],['Miguel León','complianceOfficer'],['Raúl Chávez','maintenanceOperator']]},
  {id:'org-farma',short:'farma',name:'María Delgado',manager:'María Delgado',staff:[['Valeria Rojas','pharmaOperationsCoordinator'],['Luis Gómez','pharmaTechnician'],['Elena Silva','pharmaTechnician'],['Claudia Ponce','complianceOfficer'],['Héctor Núñez','maintenanceOperator']]}
]
let number=100
const username = () => String(581200000000000000n + BigInt(++number))
const userId = () => `00000000-0000-4000-8000-${String(number).padStart(12,'0')}`
const account = (name, org, role, idx) => {
  const [firstName,...rest] = name.split(' ')
  const lastName=rest.join(' ')
  const id=role==='organizationAdmin' ? orgs.find(o=>o.id===org.id).managerId : userId()
  const facilityId=orgs.find(o=>o.id===org.id).facilityIds[idx % orgs.find(o=>o.id===org.id).facilityIds.length]
  return {id,username:username(),email:`${role==='organizationAdmin'?'gerente':`${role.replace(/([A-Z])/g,'-$1').toLowerCase()}${idx}`} .${org.short}@safelab.test`.replace(/\s/g,''),password:'SafeLab2026%',firstName,lastName,fullName:name,initials:(firstName[0]+(lastName[0]||'')).toUpperCase(),phone:`9${String(45000000+number).slice(-8)}`,role,position:role,status:'active',organizationId:org.id,organization:orgs.find(o=>o.id===org.id).name,segment:orgs.find(o=>o.id===org.id).segment,facilityId,facilityIds:orgs.find(o=>o.id===org.id).facilityIds,resourceIds:[],age:null,city:orgs.find(o=>o.id===org.id).city,jobTitle:role,timezone:'America/Lima'}
}
data.organizations=orgs
data.users=[{id:ADMIN_ID,username:ADMIN_USERNAME,email:ADMIN_EMAIL,password:ADMIN_PASSWORD,firstName:'SafeLab',lastName:'Administrator',fullName:'SafeLab Administrator',initials:'SA',phone:'999999999',role:'platformAdmin',position:'Platform Administrator',status:'active',organizationId:null,organization:'SafeLab Platform',facilityId:'global',facilityIds:[],segment:'platform'}, ...O.flatMap(org=>[account(org.manager,org,'organizationAdmin',0),...org.staff.map(([name,role],i)=>account(name,org,role,i+1))])]
data.invitations=[]
data.permissionOverrides={}
data.accountRequests=[]
// Link all existing data to its tenant using established facility / equipment / sensor relationships.
const orgByFacility = Object.fromEntries(orgs.flatMap(o=>o.facilityIds.map(id=>[id,o.id])))
const facilityOfAsset = Object.fromEntries(data.assets.map(a=>[a.id,a.facilityId]))
const facilityOfSensor = Object.fromEntries(data.sensors.map(s=>[s.id,s.facilityId]))
const facilityOfActuator = Object.fromEntries(data.actuators.map(a=>[a.id,a.facilityId]))
const facilityOfEvaluation = Object.fromEntries(data.complianceEvaluations.map(e=>[e.id,facilityOfSensor[e.sensorId]]))
const orgFor = (facilityId) => orgByFacility[facilityId] || 'org-andes'
for (const item of data.facilities) item.organizationId=orgFor(item.id)
const collections = {
  assets: r=>r.facilityId, sensors:r=>r.facilityId, alerts:r=>r.facilityId, incidents:r=>r.facilityId,
  actuators:r=>r.facilityId, complianceRules:r=>facilityOfSensor[r.sensorId],
  complianceEvaluations:r=>facilityOfSensor[r.sensorId],complianceViolations:r=>facilityOfEvaluation[r.evaluationId],
  maintenanceRecords:r=>facilityOfAsset[r.equipmentId],remoteCommands:r=>facilityOfActuator[r.actuatorId]
}
for(const [key,resolve] of Object.entries(collections)) for (const row of data[key]) row.organizationId=orgFor(resolve(row))
// Notifications, reports and audits without a direct device reference still have explicit owners.
const ownerCycle=['org-andes','org-gabriel','org-farma']
for(const key of ['notifications','reports','auditLogs']) data[key].forEach((r,i)=>r.organizationId=ownerCycle[i%ownerCycle.length])
// New human names/locations and assignments match their owning organization.
for(const org of orgs){
  const managers=data.users.filter(u=>u.organizationId===org.id)
  data.facilities.filter(f=>f.organizationId===org.id).forEach(f=>f.manager=managers[0]?.fullName)
  for(const key of ['assets','sensors','alerts','incidents','maintenanceRecords']){
    data[key].filter(r=>r.organizationId===org.id).forEach((r,i)=>{
      const assignee=managers.find(u=>u.role=== (key==='maintenanceRecords'?'maintenanceOperator':key==='alerts'||key==='incidents'?(org.segment==='laboratory'?'bioclinicalCoordinator':'pharmaOperationsCoordinator'):(org.segment==='laboratory'?'labTechnician':'pharmaTechnician'))) || managers[0]
      if ('responsible' in r) r.responsible=assignee.fullName
      if ('assignedTo' in r) r.assignedTo=assignee.fullName
    })
  }
}
// Refresh the fictional facility labels while retaining stable foreign-key identifiers.
const newFacilityNames={
 'fac-central':'Andinos Central Laboratory', 'fac-north':'Andinos North Laboratory',
 'fac-hospital':'San Gabriel Clinical Laboratory', 'fac-pharma':'FarmaAndina Cold Storage'
}
const oldNames={
 'Central Clinical Laboratory':'Andinos Central Laboratory',
 'North Province Clinical Lab':'Andinos North Laboratory',
 'San Gabriel Hospital Pharmacy':'San Gabriel Clinical Laboratory',
 'PharmAndina Cold Chain':'FarmaAndina Cold Storage'
}
for(const facility of data.facilities) facility.name=newFacilityNames[facility.id]||facility.name
for(const key of ['assets','sensors','actuators','alerts','incidents','reports'])for(const record of data[key]){
 for(const [field,value] of Object.entries(record)){
  if(typeof value==='string')for(const [oldName,newName] of Object.entries(oldNames)){
   if(record[field].includes(oldName)) record[field]=record[field].replaceAll(oldName,newName)
  }
 }
}

// Assign technicians specific equipment/sensors while coordinators manage assigned facilities.
for(const user of data.users.filter(u=>!['platformAdmin','organizationAdmin'].includes(u.role))){
  const assets=data.assets.filter(a=>a.organizationId===user.organizationId && user.facilityIds.includes(a.facilityId))
  const sensors=data.sensors.filter(s=>s.organizationId===user.organizationId && user.facilityIds.includes(s.facilityId))
  if(['labTechnician','pharmaTechnician','maintenanceOperator'].includes(user.role)){
    user.resourceIds=[...assets.filter((_,i)=>i%2=== (Number(user.username.slice(-1))%2)).map(a=>a.id),...sensors.filter((_,i)=>i%2===(Number(user.username.slice(-1))%2)).map(s=>s.id)]
    if(!user.resourceIds.length) user.resourceIds=[...(assets[0]?[assets[0].id]:[]),...(sensors[0]?[sensors[0].id]:[])]
  } else user.resourceIds=[]
}
const baseAmount=118, seatPrice=17
const amounts=orgs.map((org,i)=>({org, extra:i===2?2:0}))
data.subscriptions=amounts.map(({org,extra})=>{
  const amount=baseAmount+extra*seatPrice
  return {id:`sub-${org.id}`,organizationId:org.id,plan:'SafeLab Business',status:'active',startDate:'2026-08-06',renewalDate:'2026-12-06',includedSeats:10,additionalSeats:extra,seatPrice,baseAmount,monthlyCost:amount,currencyCode:'PEN',invoices:[
    {id:`invoice-${org.id}-202612`,number:`SL-${org.id.toUpperCase()}-202612`,amount,status:'upcoming',date:'2026-11-06',dueDate:'2026-12-06',subtotal:Number((amount/1.18).toFixed(2)),tax:Number((amount-amount/1.18).toFixed(2)),reference:''},
    ...[11,10,9,8].map(m=>({id:`invoice-${org.id}-2026${m}`,number:`SL-${org.id.toUpperCase()}-2026${m}`,amount,status:'paid',date:`2026-${String(m).padStart(2,'0')}-06`,dueDate:`2026-${String(m).padStart(2,'0')}-06`,subtotal:Number((amount/1.18).toFixed(2)),tax:Number((amount-amount/1.18).toFixed(2)),method:'Online',reference:`PAY-${org.id}-${m}`}))
  ]}
})
data.billing=data.subscriptions[0] // legacy compatibility only; UI will use active organization's subscription
export const initialMultiTenantData=data
