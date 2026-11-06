<script setup>
import { useI18n } from 'vue-i18n'
import { setLocale } from '@/shared/application/services/i18n.service'
import { useAppStore } from '@/shared/application/stores/app.store'

defineProps({title:String,subtitle:String,simple:{type:Boolean,default:false}})
const {t,locale}=useI18n()
const app=useAppStore()
</script>
<template>
  <main class="auth-page" :class="{ 'register-page':simple }">
    <div class="auth-controls" role="group" :aria-label="t('actions.language')">
      <button type="button" :aria-label="t('actions.toggleTheme')" @click="app.toggleTheme()"><i :class="app.isDarkMode?'pi pi-sun':'pi pi-moon'"></i></button>
      <button type="button" :class="{selected:locale==='en'}" @click="setLocale('en')">EN</button>
      <button type="button" :class="{selected:locale==='es'}" @click="setLocale('es')">ES</button>
    </div>
    <section v-if="!simple" class="auth-brand-panel" aria-hidden="true">
      <div class="science-watermark"><svg viewBox="0 0 300 380" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M120 26h60M132 26v123L57 276a53 53 0 0 0 45 80h96a53 53 0 0 0 45-80L168 149V26" stroke="currentColor" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><path d="M91 258c42-24 75 22 118 0l30 50a36 36 0 0 1-36 40H97a36 36 0 0 1-36-40l30-50Z" fill="currentColor" opacity=".3"/><circle cx="155" cy="279" r="11" fill="currentColor"/><circle cx="116" cy="302" r="7" fill="currentColor"/><circle cx="193" cy="303" r="6" fill="currentColor"/></svg></div>
      <div class="orb orb-one"></div><div class="orb orb-two"></div>
      <div class="brand-content"><span class="brand-overline">SAFELAB / MONITORING</span><h1>{{t('webAuth.brandTitle')}}</h1><p>{{t('webAuth.brandSubtitle')}}</p><div class="brand-features"><span><i class="pi pi-wifi"></i> {{t('webAuth.sensors')}}</span><span><i class="pi pi-shield"></i> {{t('webAuth.traceability')}}</span><span><i class="pi pi-chart-line"></i> {{t('webAuth.insights')}}</span></div></div>
    </section>
    <section class="auth-form-panel"><div class="auth-card"><header class="auth-header"><span class="auth-logo"><img src="/safelab-shield.png" alt="SafeLab"/></span><div><span class="auth-eyebrow">SAFELAB ACCESS</span><h2>{{title}}</h2><p>{{subtitle}}</p></div></header><slot/></div></section>
  </main>
</template>
<style scoped>
.auth-page{--auth-paper:var(--surface-card);position:relative;min-height:100vh;display:grid;grid-template-columns:1fr 1fr;background:var(--surface);overflow-x:hidden}
.auth-page:not(.register-page)::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse at 82% 92%,rgba(20,184,166,.12),transparent 36%);pointer-events:none}
.auth-brand-panel{background:linear-gradient(145deg,#172f85 0%,#3737a6 45%,#2261cf 85%,#168db1 100%);clip-path:polygon(0 0,100% 0,79% 100%,0 100%);width:calc(100% + 15vw);height:100%;position:relative;overflow:hidden;color:white;display:flex;align-items:center;padding:6rem max(3.5rem,8vw) 6rem max(3.5rem,8vw)}
.brand-content{max-width:520px;position:relative;z-index:2;margin-right:7vw}
.brand-overline{font-size:.8rem;letter-spacing:.22em;opacity:.83;font-weight:800}.brand-content h1{font-size:clamp(2.8rem,4.3vw,5rem);line-height:1.08;letter-spacing:-.055em;margin:1.5rem 0}.brand-content p{font-size:1.1rem;line-height:1.7;opacity:.86;max-width:440px}.brand-features{display:flex;flex-wrap:wrap;gap:10px;margin-top:2.4rem}.brand-features span{display:inline-flex;align-items:center;gap:8px;background:#ffffff1f;border:1px solid #ffffff3b;padding:11px 14px;border-radius:14px;font-weight:750}.science-watermark{position:absolute;width:min(52vw,650px);right:12%;top:9%;opacity:.14;transform:rotate(-13deg);color:#fff}.science-watermark svg{width:100%}.orb{position:absolute;border:1px solid #ffffff32;border-radius:50%;background:radial-gradient(circle at 30% 30%,#ffffff29,transparent 70%)}.orb-one{width:380px;height:380px;bottom:-160px;left:-120px}.orb-two{width:160px;height:160px;top:8%;right:19%}
.auth-form-panel{display:grid;place-items:center;padding:100px 24px 48px;min-width:0;z-index:1}.auth-card{width:min(500px,100%);padding:clamp(1.5rem,3vw,2.6rem);border-radius:32px;background:var(--auth-paper);border:1px solid var(--border);box-shadow:var(--shadow)}.auth-header{display:flex;gap:15px;align-items:center;margin-bottom:24px}.auth-logo{display:grid;place-items:center;width:64px;height:64px;flex-shrink:0;background:var(--surface-muted);border:1px solid var(--border);border-radius:20px}.auth-logo img{width:44px;height:44px;object-fit:contain}.auth-eyebrow{color:var(--primary);letter-spacing:.10em;font-size:.74rem;font-weight:900}.auth-header h2{color:var(--text);font-size:1.75rem;line-height:1.2;margin:5px 0 6px}.auth-header p{color:var(--muted);line-height:1.5;margin:0}.auth-controls{position:absolute;z-index:10;top:24px;right:30px;display:flex;align-items:center;gap:6px;padding:5px;background:var(--surface-card);border:1px solid var(--border);border-radius:20px;box-shadow:var(--shadow)}.auth-controls button{cursor:pointer;border:0;border-radius:13px;background:transparent;color:var(--muted);padding:10px 12px;font-weight:800}.auth-controls button.selected{background:var(--primary);color:white}.register-page{grid-template-columns:1fr;background:radial-gradient(circle at 16% 10%,rgba(79,70,229,.14),transparent 34%),radial-gradient(circle at 82% 88%,rgba(20,184,166,.12),transparent 35%),var(--surface)}.register-page .auth-card{width:min(680px,100%)}.register-page .auth-form-panel{padding:105px 20px 55px}
@media(max-width:1100px){.auth-brand-panel{padding-left:35px}.brand-content{margin-right:6vw}.brand-content h1{font-size:clamp(2rem,4vw,3.4rem)}}@media(max-width:820px){.auth-page{grid-template-columns:1fr}.auth-brand-panel{display:none}.auth-form-panel{padding:105px 18px 40px}.auth-card{max-width:560px}}
</style>
