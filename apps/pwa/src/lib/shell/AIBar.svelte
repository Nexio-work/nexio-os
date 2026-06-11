<script lang="ts">
  let query = $state('');

  async function handleSubmit(e: Event) {
    e.preventDefault();
    if (!query.trim()) return;
    // TODO: route to AI agent handler
    console.log('AI Query:', query);
    query = '';
  }
</script>

<form
  onsubmit={handleSubmit}
  class="ai-bar"
  style="
    position:fixed;bottom:0;left:0;right:0;z-index:999;
    height:var(--nexio-ai-bar-height,64px);
    background:rgba(255,255,255,0.85);
    backdrop-filter:blur(20px);backdrop-saturate(180%);
    -webkit-backdrop-filter:blur(20px);
    border-top:1px solid var(--md-sys-color-outline-variant);
    display:flex;align-items:center;justify-content:center;
    gap:8px;padding:0 16px;
  "
>
  <div style="
    max-width:720px;width:100%;display:flex;align-items:center;gap:8px;
  ">
    <input
      bind:value={query}
      type="text"
      placeholder="Ask anything..."
      style="
        flex:1;height:44px;border-radius:22px;
        border:1px solid var(--md-sys-color-outline-variant);
        padding:0 20px;font-size:14px;
        background:var(--md-sys-color-surface-container-low);
        color:var(--md-sys-color-on-surface);
        outline:none;
        transition:border-color 0.2s;
      "
    />
    <button
      type="submit"
      style="
        width:44px;height:44px;border-radius:50%;
        background:var(--md-sys-color-primary);
        color:white;border:none;cursor:pointer;
        font-size:18px;display:flex;align-items:center;justify-content:center;
        transition:transform 0.15s;
      "
      onmouseenter={(e) => { const t = e.currentTarget as HTMLElement; t.style.transform = 'scale(1.05)'; }}
      onmouseleave={(e) => { (e.currentTarget as HTMLElement).style.transform = ''; }}
    >➤</button>
  </div>
</form>
