<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    required: true
  }
})
</script>

<template>
  <main class="auth-page">
    <section class="auth-brand-panel">
      <div class="brand-card">
        <div class="brand-logo-wrap">
          <div class="brand-logo">
            <img src="/safelab-shield.png" alt="SafeLab logo" />
          </div>

          <div>
            <strong>SafeLab</strong>
            <span>Laboratory monitoring platform</span>
          </div>
        </div>

        <h1>Secure access for monitored laboratory operations.</h1>

        <p>
          Sign in to review sensors, alerts, incidents, reports and compliance
          status from a protected SafeLab workspace.
        </p>

        <div class="brand-metrics">
          <div>
            <strong>24/7</strong>
            <span>Sensor visibility</span>
          </div>

          <div>
            <strong>IoT</strong>
            <span>Cold chain control</span>
          </div>

          <div>
            <strong>Audit</strong>
            <span>Traceability records</span>
          </div>
        </div>
      </div>
    </section>

    <section class="auth-form-panel">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-logo">
            <img src="/safelab-shield.png" alt="SafeLab logo" />
          </div>

          <div>
            <span>SafeLab Access</span>
            <h2>{{ title }}</h2>
            <p>{{ subtitle }}</p>
          </div>
        </div>

        <slot />
      </div>
    </section>
  </main>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  background:
      radial-gradient(circle at 15% 15%, rgba(79, 70, 229, 0.16), transparent 30%),
      radial-gradient(circle at 90% 90%, rgba(16, 185, 129, 0.16), transparent 34%),
      #f8fafc;
}

.auth-brand-panel,
.auth-form-panel {
  display: grid;
  place-items: center;
  padding: 2rem;
}

.brand-card {
  width: min(620px, 100%);
  padding: 2.25rem;
  border-radius: 34px;
  color: #ffffff;
  background:
      linear-gradient(135deg, rgba(49, 46, 129, 0.96), rgba(37, 99, 235, 0.94)),
      radial-gradient(circle at right, rgba(45, 212, 191, 0.28), transparent 30%);
  box-shadow: 0 34px 90px rgba(37, 99, 235, 0.28);
  overflow: hidden;
  position: relative;
}

.brand-card::after {
  content: "";
  position: absolute;
  width: 310px;
  height: 310px;
  right: -90px;
  bottom: -110px;
  border-radius: 50%;
  border: 42px solid rgba(255, 255, 255, 0.07);
}

.brand-logo-wrap {
  display: flex;
  gap: 1rem;
  align-items: center;
  position: relative;
  z-index: 1;
}

.brand-logo {
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  border-radius: 22px;
  background: #ffffff;
  box-shadow: 0 16px 38px rgba(15, 23, 42, 0.18);
}

.brand-logo img {
  width: 42px;
  height: 42px;
  object-fit: contain;
}

.brand-logo-wrap strong,
.brand-logo-wrap span {
  display: block;
}

.brand-logo-wrap strong {
  font-size: 1.35rem;
}

.brand-logo-wrap span {
  opacity: 0.86;
  font-weight: 700;
}

.brand-card h1 {
  max-width: 560px;
  margin: 2rem 0 1rem;
  font-size: clamp(2.4rem, 5vw, 4.25rem);
  line-height: 0.98;
  position: relative;
  z-index: 1;
}

.brand-card p {
  max-width: 520px;
  margin: 0;
  line-height: 1.65;
  opacity: 0.9;
  font-weight: 600;
  position: relative;
  z-index: 1;
}

.brand-metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 2rem;
  position: relative;
  z-index: 1;
}

.brand-metrics div {
  display: grid;
  gap: 0.25rem;
  padding: 1rem;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(8px);
}

.brand-metrics strong {
  font-size: 1.35rem;
}

.brand-metrics span {
  opacity: 0.86;
  font-weight: 700;
}

.auth-card {
  width: min(520px, 100%);
  padding: 2rem;
  border-radius: 30px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 28px 80px rgba(15, 23, 42, 0.12);
}

.auth-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.auth-logo {
  display: grid;
  place-items: center;
  width: 62px;
  height: 62px;
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 14px 30px rgba(79, 70, 229, 0.18);
}

.auth-logo img {
  width: 42px;
  height: 42px;
  object-fit: contain;
}

.auth-header span {
  color: #4f46e5;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.auth-header h2 {
  margin: 0.2rem 0;
  color: #0f172a;
  font-size: 1.8rem;
}

.auth-header p {
  margin: 0;
  color: #64748b;
  font-weight: 600;
  line-height: 1.4;
}

@media (max-width: 980px) {
  .auth-page {
    grid-template-columns: 1fr;
  }

  .auth-brand-panel {
    display: none;
  }
}
</style>