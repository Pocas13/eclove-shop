export default function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-3 ${inverse ? "text-white" : "text-grafite-900"}`}>
      <span className={inverse ? "rounded bg-white px-2 py-1" : ""}>
        <img src="/marca/logotipo.png" alt="Eclove" className="h-9 w-auto max-w-[150px] object-contain" />
      </span>
    </span>
  );
}
