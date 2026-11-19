export default function Offline() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg p-8 text-center">
      <h1 className="text-[22px] font-semibold tracking-[-0.02em] text-text">Anda sedang offline</h1>
      <p className="max-w-xs text-[13px] leading-relaxed text-text-muted">
        Halaman tidak dapat dimuat, tetapi data Anda tetap tersimpan aman di perangkat ini.
      </p>
    </div>
  );
}
