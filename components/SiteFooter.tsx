export default function SiteFooter() {
  return (
    <div className="site-footer-wrap mt-16">
      <footer className="site-footer">
        <img
          src="/footer-frame.png?v=2"
          alt=""
          className="site-footer-art"
          aria-hidden="true"
        />
        <div className="container-narrow site-footer-content">
          <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="font-serif text-ink">Eidgah Times</span> — crowd-verified
              prayer times. Confirm locally before travelling.
            </div>
            <div className="text-xs text-ink-muted">
              Map tiles © OpenStreetMap contributors.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
