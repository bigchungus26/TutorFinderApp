const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-16">
    <h2 className="text-display-lg mb-6">{title}</h2>
    <div className="border-t border-hairline pt-6">{children}</div>
  </section>
);

const Swatch = ({ name, cssVar, className }: { name: string; cssVar: string; className: string }) => (
  <div className="flex items-center gap-3">
    <div className={`w-12 h-12 rounded-lg border border-hairline ${className}`} />
    <div>
      <div className="text-label">{name}</div>
      <div className="text-caption text-ink-muted">{cssVar}</div>
    </div>
  </div>
);

const DesignSystem = () => {
  return (
    <div className="min-h-screen bg-background px-6 pt-10 pb-20 max-w-2xl mx-auto">
      <div className="mb-12">
        <span className="text-caption text-accent uppercase tracking-wider">Internal</span>
        <h1 className="text-display-xl mt-1">Design System</h1>
        <p className="text-body-lg text-ink-muted mt-2">Tutr token reference — colors, type, spacing, components.</p>
      </div>

      {/* ── Colors ── */}
      <Section title="Colors">
        <div className="space-y-8">
          <div>
            <h3 className="text-display-sm mb-4">Backgrounds</h3>
            <div className="grid grid-cols-2 gap-4">
              <Swatch name="background" cssVar="--background" className="bg-background" />
              <Swatch name="surface" cssVar="--surface" className="bg-surface" />
              <Swatch name="surface-elevated" cssVar="--surface-elevated" className="bg-surface-elevated shadow-float" />
              <Swatch name="muted" cssVar="--muted" className="bg-muted" />
            </div>
          </div>

          <div>
            <h3 className="text-display-sm mb-4">Text (Ink)</h3>
            <div className="grid grid-cols-2 gap-4">
              <Swatch name="ink" cssVar="--ink" className="bg-ink" />
              <Swatch name="ink-muted" cssVar="--ink-muted" className="bg-ink-muted" />
              <Swatch name="ink-subtle" cssVar="--ink-subtle" className="bg-ink-subtle" />
            </div>
          </div>

          <div>
            <h3 className="text-display-sm mb-4">Accent</h3>
            <div className="grid grid-cols-2 gap-4">
              <Swatch name="accent" cssVar="--accent" className="bg-accent" />
              <Swatch name="accent-soft" cssVar="--accent-soft" className="bg-accent-soft" />
              <Swatch name="accent-foreground" cssVar="--accent-foreground" className="bg-accent-foreground border-2" />
            </div>
          </div>

          <div>
            <h3 className="text-display-sm mb-4">Borders</h3>
            <div className="grid grid-cols-2 gap-4">
              <Swatch name="hairline" cssVar="--hairline" className="bg-hairline" />
              <Swatch name="border" cssVar="--border" className="bg-border" />
            </div>
          </div>

          <div>
            <h3 className="text-display-sm mb-4">Status</h3>
            <div className="grid grid-cols-3 gap-4">
              <Swatch name="success" cssVar="--success" className="bg-success" />
              <Swatch name="warning" cssVar="--warning" className="bg-warning" />
              <Swatch name="danger" cssVar="--danger" className="bg-danger" />
            </div>
          </div>

          <div>
            <h3 className="text-display-sm mb-4">University Tints</h3>
            <div className="grid grid-cols-3 gap-4">
              <Swatch name="uni-aub" cssVar="--uni-aub" className="bg-uni-aub" />
              <Swatch name="uni-lau" cssVar="--uni-lau" className="bg-uni-lau" />
              <Swatch name="uni-ndu" cssVar="--uni-ndu" className="bg-uni-ndu" />
            </div>
          </div>
        </div>
      </Section>

      {/* ── Typography ── */}
      <Section title="Typography">
        <div className="space-y-6">
          {[
            { cls: "text-display-xl", label: "display-xl", spec: "Fraunces 36/44 · 500 · -0.02em" },
            { cls: "text-display-lg", label: "display-lg", spec: "Fraunces 28/36 · 500" },
            { cls: "text-display-md", label: "display-md", spec: "Fraunces 22/30 · 500" },
            { cls: "text-display-sm", label: "display-sm", spec: "Fraunces 18/26 · 500" },
            { cls: "text-body-lg", label: "body-lg", spec: "Inter 16/24 · 400" },
            { cls: "text-body", label: "body", spec: "Inter 15/22 · 400" },
            { cls: "text-body-sm", label: "body-sm", spec: "Inter 14/20 · 400" },
            { cls: "text-label", label: "label", spec: "Inter 13/18 · 500" },
            { cls: "text-caption", label: "caption", spec: "Inter 12/16 · 500 · 0.01em" },
          ].map(t => (
            <div key={t.label} className="flex items-baseline gap-4 border-b border-hairline pb-4">
              <div className="w-28 shrink-0">
                <div className="text-label text-accent">{t.label}</div>
                <div className="text-caption text-ink-subtle mt-0.5">{t.spec}</div>
              </div>
              <p className={t.cls}>The quick brown fox jumps over the lazy dog</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Spacing ── */}
      <Section title="Spacing Scale">
        <p className="text-body-sm text-ink-muted mb-4">Based on 4px grid. Allowed values shown below.</p>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24].map(n => (
            <div key={n} className="flex items-center gap-3">
              <span className="w-8 text-caption text-ink-muted text-right">{n}</span>
              <div className="bg-accent rounded-sm" style={{ width: `${n * 4}px`, height: 12 }} />
              <span className="text-caption text-ink-subtle">{n * 4}px</span>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Radius ── */}
      <Section title="Radius">
        <div className="grid grid-cols-2 gap-4">
          {[
            { name: "radius-sm", cls: "rounded-sm", val: "8px" },
            { name: "radius-md", cls: "rounded-md", val: "14px" },
            { name: "radius-lg", cls: "rounded-lg", val: "20px" },
            { name: "radius-xl", cls: "rounded-xl", val: "28px" },
            { name: "radius-full", cls: "rounded-pill", val: "999px" },
          ].map(r => (
            <div key={r.name} className="flex items-center gap-3">
              <div className={`w-16 h-16 bg-accent-soft border-2 border-accent ${r.cls}`} />
              <div>
                <div className="text-label">{r.name}</div>
                <div className="text-caption text-ink-muted">{r.val} · .{r.cls}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Shadows ── */}
      <Section title="Shadows">
        <div className="grid grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-full h-20 bg-surface rounded-lg border border-hairline shadow-none mb-2" />
            <div className="text-label">shadow-none</div>
            <div className="text-caption text-ink-muted">Default — use borders</div>
          </div>
          <div className="text-center">
            <div className="w-full h-20 bg-surface rounded-lg shadow-float mb-2" />
            <div className="text-label">shadow-float</div>
            <div className="text-caption text-ink-muted">Tab bar, modals</div>
          </div>
          <div className="text-center">
            <div className="w-full h-20 bg-surface rounded-lg shadow-press mb-2" />
            <div className="text-label">shadow-press</div>
            <div className="text-caption text-ink-muted">Pressed states</div>
          </div>
        </div>
      </Section>

      {/* ── Buttons ── */}
      <Section title="Buttons">
        <div className="space-y-6">
          <div>
            <h3 className="text-label text-ink-muted mb-3">Primary (accent)</h3>
            <div className="flex flex-wrap gap-3">
              <button className="h-14 px-6 rounded-lg bg-accent text-accent-foreground font-body font-semibold text-base">Default</button>
              <button className="h-14 px-6 rounded-lg bg-accent text-accent-foreground font-body font-semibold text-base opacity-80">Hover</button>
              <button className="h-14 px-6 rounded-lg bg-accent text-accent-foreground font-body font-semibold text-base opacity-40">Disabled</button>
              <button className="h-14 px-6 rounded-lg bg-accent text-accent-foreground font-body font-semibold text-base opacity-60 flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Loading
              </button>
            </div>
          </div>
          <div>
            <h3 className="text-label text-ink-muted mb-3">Secondary (outline)</h3>
            <div className="flex flex-wrap gap-3">
              <button className="h-14 px-6 rounded-lg border border-hairline bg-surface font-body font-medium text-base">Default</button>
              <button className="h-14 px-6 rounded-lg border border-hairline bg-muted font-body font-medium text-base">Hover</button>
              <button className="h-14 px-6 rounded-lg border border-hairline bg-surface font-body font-medium text-base opacity-40">Disabled</button>
            </div>
          </div>
          <div>
            <h3 className="text-label text-ink-muted mb-3">Destructive</h3>
            <div className="flex flex-wrap gap-3">
              <button className="h-14 px-6 rounded-lg bg-danger text-danger-foreground font-body font-semibold text-base">Delete</button>
              <button className="h-14 px-6 rounded-lg bg-danger text-danger-foreground font-body font-semibold text-base opacity-40">Disabled</button>
            </div>
          </div>
          <div>
            <h3 className="text-label text-ink-muted mb-3">Chip / pill</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-4 py-2 rounded-pill bg-accent text-accent-foreground text-sm font-medium">Active</span>
              <span className="px-4 py-2 rounded-pill bg-surface border border-hairline text-foreground text-sm font-medium">Inactive</span>
              <span className="px-4 py-2 rounded-pill bg-foreground text-background text-sm font-medium">Tab active</span>
              <span className="px-4 py-2 rounded-pill text-muted-ink text-sm font-medium">Tab inactive</span>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Inputs ── */}
      <Section title="Inputs">
        <div className="space-y-4 max-w-sm">
          <div>
            <label className="text-label text-ink-muted mb-1.5 block">Default</label>
            <input type="text" placeholder="Placeholder text" className="w-full p-3.5 rounded-md border border-hairline bg-surface font-body text-sm" />
          </div>
          <div>
            <label className="text-label text-ink-muted mb-1.5 block">Focused</label>
            <input type="text" defaultValue="Typed value" className="w-full p-3.5 rounded-md border-2 border-accent bg-surface font-body text-sm ring-2 ring-accent/20" />
          </div>
          <div>
            <label className="text-label text-danger mb-1.5 block">Error</label>
            <input type="text" defaultValue="Invalid input" className="w-full p-3.5 rounded-md border-2 border-danger bg-surface font-body text-sm" />
            <p className="text-caption text-danger mt-1">This field is required.</p>
          </div>
          <div>
            <label className="text-label text-ink-subtle mb-1.5 block">Disabled</label>
            <input type="text" disabled placeholder="Can't edit" className="w-full p-3.5 rounded-md border border-hairline bg-muted font-body text-sm text-ink-subtle cursor-not-allowed" />
          </div>
        </div>
      </Section>

      {/* ── Cards ── */}
      <Section title="Cards">
        <div className="space-y-4">
          <div className="bg-surface rounded-xl border border-hairline p-4 flex gap-3.5">
            <div className="w-12 h-12 rounded-full bg-accent-soft flex-shrink-0" />
            <div className="flex-1">
              <div className="text-body font-display font-medium">Karim Haddad</div>
              <div className="text-body-sm text-ink-muted">Computer Science, Senior</div>
              <div className="flex gap-1 mt-2">
                <span className="text-caption px-2 py-0.5 rounded-pill bg-muted font-medium">CMPS 200</span>
                <span className="text-caption px-2 py-0.5 rounded-pill bg-muted font-medium">CMPS 211</span>
              </div>
            </div>
            <span className="text-body font-display font-medium">$15<span className="text-caption text-ink-muted font-body">/hr</span></span>
          </div>
          <div className="bg-surface rounded-xl border border-hairline p-3.5">
            <div className="w-full h-1 rounded-full bg-accent mb-3" />
            <div className="text-body-sm font-display font-medium">CMPS 200</div>
            <div className="text-caption text-ink-muted">Introduction to Programming</div>
          </div>
        </div>
      </Section>

      {/* ── Chips & Badges ── */}
      <Section title="Chips &amp; Badges">
        <div className="space-y-4">
          <div>
            <h3 className="text-label text-ink-muted mb-3">Course chips</h3>
            <div className="flex gap-2">
              <span className="text-caption px-2 py-0.5 rounded-pill bg-muted font-medium">CMPS 200</span>
              <span className="text-caption px-2 py-0.5 rounded-pill bg-muted font-medium">MATH 201</span>
              <span className="text-caption px-2 py-0.5 rounded-pill bg-muted text-ink-muted">+3</span>
            </div>
          </div>
          <div>
            <h3 className="text-label text-ink-muted mb-3">University tints</h3>
            <div className="flex gap-2">
              <span className="text-caption px-2.5 py-0.5 rounded-pill font-medium bg-uni-aub/10 text-uni-aub">AUB</span>
              <span className="text-caption px-2.5 py-0.5 rounded-pill font-medium bg-uni-lau/10 text-uni-lau">LAU</span>
              <span className="text-caption px-2.5 py-0.5 rounded-pill font-medium bg-uni-ndu/10 text-uni-ndu">NDU</span>
            </div>
          </div>
          <div>
            <h3 className="text-label text-ink-muted mb-3">Status badges</h3>
            <div className="flex gap-2">
              <span className="text-caption px-2 py-1 rounded-pill bg-accent-soft text-accent font-medium">Online</span>
              <span className="text-caption px-2 py-1 rounded-pill bg-muted text-foreground font-medium">In-person</span>
              <span className="text-caption px-2 py-1 rounded-pill bg-success/10 text-success font-medium">Completed</span>
              <span className="text-caption px-2 py-1 rounded-pill bg-danger/10 text-danger font-medium">Cancelled</span>
            </div>
          </div>
        </div>
      </Section>

      {/* ── Empty States ── */}
      <Section title="Empty States">
        <div className="text-center py-12 bg-surface rounded-xl border border-hairline">
          <div className="w-20 h-20 rounded-full bg-accent-soft mx-auto mb-4 flex items-center justify-center">
            <div className="w-8 h-8 rounded-lg bg-accent/20" />
          </div>
          <p className="text-display-sm mb-1">No sessions yet</p>
          <p className="text-body-sm text-ink-muted">Book a tutor to get started.</p>
        </div>
      </Section>

      {/* ── Loading Skeletons ── */}
      <Section title="Loading Skeletons">
        <p className="text-body-sm text-ink-muted mb-4">Reserved — skeleton components to be built.</p>
        <div className="space-y-3">
          <div className="bg-surface rounded-xl border border-hairline p-4 flex gap-3.5 animate-pulse">
            <div className="w-12 h-12 rounded-full bg-muted flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-32" />
              <div className="h-3 bg-muted rounded w-48" />
              <div className="flex gap-1 mt-1">
                <div className="h-5 bg-muted rounded-pill w-16" />
                <div className="h-5 bg-muted rounded-pill w-16" />
              </div>
            </div>
          </div>
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </Section>
    </div>
  );
};

export default DesignSystem;
