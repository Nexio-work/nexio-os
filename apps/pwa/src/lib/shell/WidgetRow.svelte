<script lang="ts">
  // Mock data — real values come from API + sync engine
  const widgets = [
    { icon: '💰', label: 'Cashflow', value: '+$2,450', trend: 'up' },
    { icon: '📋', label: 'Tâches actives', value: '12', trend: 'neutral' },
    { icon: '⚠️', label: 'Alertes', value: '3', trend: 'down' },
  ];
</script>

<section class="widget-row" style="
  display:flex;gap:12px;overflow-x:auto;
  padding-bottom:4px;
">
  {#each widgets as w (w.label)}
    <article class="nexio-card" style="
      min-width:180px;flex:1;
      padding:16px;
      display:flex;flex-direction:column;gap:4px;
    ">
      <span style="font-size:20px;">{w.icon}</span>
      <span style="
        font-size:11px;text-transform:uppercase;letter-spacing:0.5px;
        color:var(--md-sys-color-on-surface-variant);
      ">{w.label}</span>
      <strong style="
        font-size:22px;font-weight:600;
        color:var(--md-sys-color-on-surface);
      ">{w.value}</strong>
      <span style="
        font-size:12px;
        color:{w.trend === 'up' ? '#10b981' : w.trend === 'down' ? '#ef4444' : '#9ca3af'};
      ">
        {w.trend === 'up' ? '↑' : w.trend === 'down' ? '↓' : '—'}
      </span>
    </article>
  {/each}
</section>
