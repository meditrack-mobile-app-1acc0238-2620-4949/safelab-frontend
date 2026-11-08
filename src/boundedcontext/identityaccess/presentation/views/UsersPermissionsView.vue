<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteLeave } from 'vue-router'
import { useAuthStore } from '../../application/stores/auth.store'
import { useSafeLabDemoStore } from '@/shared/application/stores/demo.store'
import { PERMISSION_GROUPS, ALL_PERMISSIONS, ROLE_DEFAULTS, ROLE_GRANTABLE, SEGMENT_ROLES } from '../../domain/models/permission-catalog'
import { downloadCsv } from '@/shared/application/services/csv-export'
import LocalizedStatusBadge from '@/shared/presentation/components/LocalizedStatusBadge.vue'

const auth=useAuthStore(), demo=useSafeLabDemoStore(), {t,locale}=useI18n()
const tab=ref('employees'), search=ref(''),selectedId=ref(''), draft=ref({}),saved=ref({}), notice=ref('')
const inviting=ref(false), invitationEmail=ref(''), invitationRole=ref(''), inviteFacilities=ref([]), inviteAssets=ref([])
const org=computed(()=>demo.organizations.find(o=>o.id===auth.currentUser?.organizationId))
const staff=computed(()=>demo.organizationUsers(org.value?.id).filter(u=>u.role!=='organizationAdmin'))
const members=computed(()=>staff.value.filter(u=>!search.value || `${u.fullName} ${u.email} ${u.role}`.toLowerCase().includes(search.value.toLowerCase())))
const selected=computed(()=>staff.value.find(u=>u.id===selectedId.value))
const subscription=computed(()=>demo.subscriptionFor(org.value?.id))
const occupied=computed(()=>demo.occupiedSeats(org.value?.id))
const reserved=computed(()=>demo.reservedSeats(org.value?.id))
const capacity=computed(()=>(subscription.value?.includedSeats||0)+(subscription.value?.additionalSeats||0))
const roles=computed(()=>SEGMENT_ROLES[org.value?.segment]||[])
const facilities=computed(()=>demo.data.facilities.filter(f=>f.organizationId===org.value?.id))
const devices=computed(()=>demo.data.assets.filter(a=>a.organizationId===org.value?.id))
const dirty=computed(()=>ALL_PERMISSIONS.some(p=>draft.value[p]!==saved.value[p]))
const hasScopeChanges=computed(()=>JSON.stringify(scopeFacilities.value)!==JSON.stringify(selected.value?.facilityIds||[])||JSON.stringify(scopeAssets.value)!==JSON.stringify(selected.value?.resourceIds||[]))
const scopeFacilities=ref([]), scopeAssets=ref([])
const allowed=computed(()=>ROLE_GRANTABLE[selected.value?.role]||[])
const roleDefault=computed(()=>ROLE_DEFAULTS[selected.value?.role]||[])
function loadUser(user){
  if((dirty.value||hasScopeChanges.value) && !window.confirm(t('multi.discard')))return
  selectedId.value=user.id
  saved.value=Object.fromEntries(ALL_PERMISSIONS.map(p=>[p,(demo.data.permissionOverrides[user.id]?.[p] ?? roleDefaultFor(user.role,p))]))
  draft.value={...saved.value};scopeFacilities.value=[...(user.facilityIds||[])];scopeAssets.value=[...(user.resourceIds||[])]
  notice.value=''
}
const roleDefaultFor=(role,p)=>(ROLE_DEFAULTS[role]||[]).includes(p)
watch(staff,(people)=>{if(!selectedId.value && people.length)loadUser(people[0])},{immediate:true})
function resetDefault(){draft.value=Object.fromEntries(ALL_PERMISSIONS.map(p=>[p,roleDefaultFor(selected.value.role,p)]));notice.value=''}
function cancel(){draft.value={...saved.value};scopeFacilities.value=[...(selected.value?.facilityIds||[])];scopeAssets.value=[...(selected.value?.resourceIds||[])];notice.value=''}
async function save(){
  if(!selected.value)return
  try {
    if(dirty.value && !await demo.savePermissionOverrides(selected.value.id,draft.value,auth.currentUser))return
    if(hasScopeChanges.value)await demo.saveResourceAssignments(selected.value.id,scopeFacilities.value,scopeAssets.value,auth.currentUser)
    saved.value={...draft.value};notice.value=t('multi.saved')
  } catch(error){notice.value=error.message}
}
function selectTab(value){if((dirty.value||hasScopeChanges.value)&&!window.confirm(t('multi.discard')))return;cancel();tab.value=value}
onBeforeRouteLeave(()=>!dirty.value&&!hasScopeChanges.value||window.confirm(t('multi.discard')))
async function createInvitation(){
  const result=await demo.createInvitation({email:invitationEmail.value,role:invitationRole.value,facilityIds:inviteFacilities.value,resourceIds:inviteAssets.value},auth.currentUser)
  if(result.error){notice.value=t(`multi.inviteError_${result.error}`);return}
  notice.value=t('multi.inviteCreated');inviting.value=false;invitationEmail.value='';invitationRole.value='';inviteFacilities.value=[];inviteAssets.value=[]
}
function exportEmployees(){downloadCsv('safelab-employees',members.value.map(u=>({username:u.username,name:u.fullName,email:u.email,role:t(`multi.role_${u.role}`),status:t(`platformUi.state_${u.status}`),organization:org.value?.name}))) }
function toggleArray(array,id){return array.includes(id)?array.filter(v=>v!==id):[...array,id]}
function copyCode(code){if(navigator.clipboard?.writeText)navigator.clipboard.writeText(code);notice.value=t('multi.codeInfo')}
</script>
<template>
<section class="page">
  <div class="page-hero compact"><div><h1>{{t('multi.usersTitle')}}</h1><p>{{t('multi.usersDescription')}} · {{org?.name}}</p></div></div>
  <div class="kpi-grid">
    <article class="kpi-card"><span class="kpi-icon"><i class="pi pi-users"></i></span><span class="kpi-copy"><span>{{t('multi.employees')}}</span><strong>{{occupied}}</strong><small>{{t('multi.activeStaff')}}</small></span></article>
    <article class="kpi-card"><span class="kpi-icon"><i class="pi pi-ticket"></i></span><span class="kpi-copy"><span>{{t('multi.pendingInvites')}}</span><strong>{{reserved}}</strong><small>{{t('multi.reservedSeats')}}</small></span></article>
    <article class="kpi-card success"><span class="kpi-icon"><i class="pi pi-check-circle"></i></span><span class="kpi-copy"><span>{{t('multi.availableSeats')}}</span><strong>{{Math.max(0,capacity-occupied-reserved)}}</strong><small>{{t('multi.capacity')}}: {{capacity}}</small></span></article>
  </div>
  <div class="filter-bar multi-tabs">
    <button v-for="key in ['employees','invitations','permissions','assignments']" :key="key" type="button" :class="['btn',tab===key?'primary':'']" @click="selectTab(key)">{{t(`multi.${key}`)}}</button>
  </div>
  <p v-if="notice" class="notice-strip" role="status">{{notice}}</p>
  <article v-if="tab==='employees'" class="card">
    <div class="card-header"><div><h2>{{t('multi.employees')}}</h2><p>{{t('multi.employeesHint')}}</p></div><div class="actions"><button class="btn" type="button" @click="exportEmployees"><i class="pi pi-download"></i> CSV</button></div></div>
    <input v-model="search" class="input search-input" :placeholder="t('multi.searchStaff')" />
    <div class="table-scroll"><table class="responsive-table"><thead><tr><th>{{t('multi.name')}}</th><th>{{t('multi.role')}}</th><th>{{t('multi.email')}}</th><th>{{t('multi.status')}}</th><th></th></tr></thead><tbody>
      <tr v-for="u in members" :key="u.id"><td><strong>{{u.fullName}}</strong><br><small>{{u.username}}</small></td><td>{{t(`multi.role_${u.role}`)}}</td><td>{{u.email}}</td><td><LocalizedStatusBadge :status="u.status"/></td><td><button class="btn small" type="button" @click="loadUser(u);tab='permissions'">{{t('multi.manage')}}</button></td></tr>
    </tbody></table></div>
  </article>
  <article v-else-if="tab==='invitations'" class="card">
    <div class="card-header"><div><h2>{{t('multi.invitations')}}</h2><p>{{t('multi.inviteHint')}}</p></div><button class="btn primary" type="button" :disabled="!demo.availableSeats(org?.id)" @click="inviting=!inviting"><i class="pi pi-plus"></i> {{t('multi.invite')}}</button></div>
    <form v-if="inviting" class="invitation-form" @submit.prevent="createInvitation"><div class="field"><label>{{t('multi.email')}}</label><input v-model.trim="invitationEmail" type="email" class="input" required/></div><div class="field"><label>{{t('multi.role')}}</label><select v-model="invitationRole" class="select" required><option value="" disabled>{{t('multi.selectRole')}}</option><option v-for="role in roles" :key="role" :value="role">{{t(`multi.role_${role}`)}}</option></select></div><div class="field full"><label>{{t('multi.facilities')}}</label><div class="check-grid"><label v-for="f in facilities" :key="f.id"><input type="checkbox" :checked="inviteFacilities.includes(f.id)" @change="inviteFacilities=toggleArray(inviteFacilities,f.id)"/> {{f.name}}</label></div></div><div class="field full"><label>{{t('multi.resources')}}</label><div class="check-grid"><label v-for="a in devices" :key="a.id"><input type="checkbox" :checked="inviteAssets.includes(a.id)" @change="inviteAssets=toggleArray(inviteAssets,a.id)"/> {{a.name}}</label></div></div><div class="actions full"><button class="btn primary" type="submit">{{t('multi.createInvitation')}}</button><button class="btn" type="button" @click="inviting=false">{{t('multi.cancel')}}</button></div></form>
    <div class="table-scroll"><table class="responsive-table"><thead><tr><th>{{t('multi.email')}}</th><th>{{t('multi.role')}}</th><th>{{t('multi.code')}}</th><th>{{t('multi.expires')}}</th><th>{{t('multi.status')}}</th><th></th></tr></thead><tbody><tr v-for="invite in demo.invitations.filter(i=>i.organizationId===org?.id)" :key="invite.id"><td>{{invite.email}}</td><td>{{t(`multi.role_${invite.role}`)}}</td><td><button class="btn small" type="button" @click="copyCode(invite.token)">{{invite.token.slice(0,10)}}… <i class="pi pi-copy"></i></button><small class="invite-code">{{invite.token}}</small></td><td>{{new Date(invite.expiresAt).toLocaleDateString(locale==='es'?'es-PE':'en-US')}}</td><td><LocalizedStatusBadge :status="invite.status"/></td><td><button v-if="invite.status==='pending'" class="btn small" @click="demo.cancelInvitation(invite.id,auth.currentUser)">{{t('multi.cancel')}}</button></td></tr></tbody></table></div>
  </article>
  <div v-else class="grid-2 admin-editor">
    <article class="card"><div class="card-header"><div><h2>{{t('multi.selectEmployee')}}</h2></div></div><div class="item-list"><button v-for="u in staff" :key="u.id" type="button" :class="['list-row','select-employee',selectedId===u.id?'selected':'']" @click="loadUser(u)"><span><strong>{{u.fullName}}</strong><small>{{t(`multi.role_${u.role}`)}}</small></span><i class="pi pi-chevron-right"></i></button></div></article>
    <article class="card editor-card" v-if="selected"><div class="card-header"><div><p class="eyebrow">{{org?.name}}</p><h2>{{selected.fullName}}</h2><p>{{t(`multi.role_${selected.role}`)}}</p></div></div>
      <template v-if="tab==='permissions'"><div v-for="group in PERMISSION_GROUPS" :key="group.id" class="permission-group"><h3>{{t(`multi.group_${group.id}`)}}</h3><div v-for="p in group.permissions" :key="p" class="permission-row"><div><strong>{{t(`multi.permission_${p.replaceAll('.','_')}`)}}</strong><small>{{t(`multi.description_${p.replaceAll('.','_')}`)}}</small></div><label class="switch"><input type="checkbox" :checked="!!draft[p]" :disabled="!allowed.includes(p)" @change="draft[p]=$event.target.checked" :aria-label="t(`multi.permission_${p.replaceAll('.','_')}`)"/><span></span></label></div></div></template>
      <template v-else><h3>{{t('multi.facilities')}}</h3><div class="check-grid"><label v-for="f in facilities" :key="f.id"><input type="checkbox" :checked="scopeFacilities.includes(f.id)" @change="scopeFacilities=toggleArray(scopeFacilities,f.id)"/> {{f.name}}</label></div><h3>{{t('multi.resources')}}</h3><div class="check-grid"><label v-for="a in devices" :key="a.id"><input type="checkbox" :checked="scopeAssets.includes(a.id)" @change="scopeAssets=toggleArray(scopeAssets,a.id)"/> {{a.name}}</label></div></template>
      <div v-if="dirty||hasScopeChanges" class="notice-strip">{{t('multi.unsaved')}}</div>
      <footer class="editor-actions"><button class="btn" type="button" @click="cancel">{{t('multi.cancel')}}</button><button v-if="tab==='permissions'" class="btn" type="button" @click="resetDefault">{{t('multi.restoreDefaults')}}</button><button class="btn primary" type="button" :disabled="!dirty&&!hasScopeChanges" @click="save"><i class="pi pi-check"></i> {{t('multi.saveChanges')}}</button></footer>
    </article>
  </div>
</section>
</template>
<style scoped>
.search-input{width:100%;max-width:380px;margin-bottom:16px}.multi-tabs{display:flex;flex-wrap:wrap;gap:10px}.admin-editor{grid-template-columns:minmax(230px,.7fr) minmax(0,1.3fr);align-items:start}.select-employee{width:100%;background:none;border:0;color:var(--text);cursor:pointer;text-align:left}.select-employee.selected{background:var(--surface-soft);border-radius:10px}.permission-group{padding:10px 0;border-top:1px solid var(--border)}.permission-group h3{font-size:1rem;margin:9px 0}.permission-row{display:flex;justify-content:space-between;align-items:center;gap:15px;padding:11px 0;border-bottom:1px solid var(--border)}.permission-row strong,.permission-row small{display:block}.permission-row strong{font-size:.91rem;color:var(--text)}.permission-row small{color:var(--muted);font-size:.82rem;line-height:1.4;margin-top:3px}.switch{display:block;position:relative;flex-shrink:0;width:42px;height:24px}.switch input{opacity:0;position:absolute}.switch span{position:absolute;inset:0;border-radius:15px;background:var(--border);cursor:pointer;transition:.15s}.switch span:after{content:'';position:absolute;left:3px;top:3px;width:18px;height:18px;border-radius:50%;background:white;box-shadow:0 1px 4px #0003;transition:.15s}.switch input:checked+span{background:var(--primary)}.switch input:checked+span:after{transform:translateX(18px)}.switch input:disabled+span{opacity:.4;cursor:not-allowed}.switch input:focus-visible+span{outline:3px solid var(--primary)}.editor-actions{display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap;margin-top:20px}.notice-strip{padding:12px 16px;margin:12px 0;background:var(--surface-soft);border:1px solid var(--border);border-radius:12px;color:var(--text)}.invitation-form{display:grid;grid-template-columns:1fr 1fr;gap:15px;margin-bottom:22px;padding:15px;border:1px solid var(--border);border-radius:14px}.invitation-form .full{grid-column:1/-1}.invitation-form .field{min-width:0}.check-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:10px;margin:10px 0 18px}.check-grid label{display:flex;align-items:center;gap:8px;font-size:.86rem;color:var(--text)}.invite-code{display:block;color:var(--muted);word-break:break-all;margin-top:4px}.table-scroll{overflow:auto}.responsive-table{min-width:690px;table-layout:auto}.responsive-table th,.responsive-table td{overflow-wrap:anywhere}.invite-code{user-select:all}@media(max-width:850px){.admin-editor{grid-template-columns:1fr}.invitation-form{grid-template-columns:1fr}}
</style>
