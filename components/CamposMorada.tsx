"use client";

import { useEffect, useId, useRef, useState } from "react";

type Props = {
  prefixo?: string;
  valores?: {
    codigoPostal?: string;
    rua?: string;
    numeroPorta?: string;
    andar?: string;
    ladoPorta?: string;
    cidade?: string;
  };
  obrigatorio?: boolean;
  classNameInput?: string;
};

type PostalEntry = {
  localidade?: string;
  designacaoPostal?: string;
  ruas?: string[];
};

type PostalShard = Record<string, PostalEntry>;

type ValidationState = "idle" | "loading" | "valid" | "invalid";

const shardCache = new Map<string, PostalShard>();

function formatPostalCode(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 7);
  return digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : digits;
}

function uniqueStrings(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return [...new Set(values
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.replace(/\s+/g, " ").trim())
    .filter(Boolean))];
}

async function loadPostalShard(prefix: string): Promise<PostalShard> {
  const cached = shardCache.get(prefix);
  if (cached) return cached;

  const response = await fetch(`/dados/codigos-postais/${prefix}.json`, {
    method: "GET",
    cache: "force-cache",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Base de códigos postais indisponível (${response.status}).`);
  }

  const data = await response.json() as unknown;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("Resposta inválida da base de códigos postais.");
  }

  const shard = data as PostalShard;
  shardCache.set(prefix, shard);
  return shard;
}

export default function CamposMorada({ prefixo = "", valores = {}, obrigatorio = true, classNameInput }: Props) {
  const fieldName = (field: string) => `${prefixo}${field}`;
  const listId = useId().replace(/:/g, "");
  const defaultInput = "w-full rounded-md border border-areia-300 bg-white p-3";
  const input = classNameInput ?? defaultInput;
  const requestId = useRef(0);
  const lastValidatedCode = useRef("");

  const [codigoPostal, setCodigoPostal] = useState(formatPostalCode(valores.codigoPostal ?? ""));
  const [rua, setRua] = useState(valores.rua ?? "");
  const [cidade, setCidade] = useState(valores.cidade ?? "");
  const [ruas, setRuas] = useState<string[]>([]);
  const [state, setState] = useState<ValidationState>("idle");
  const [message, setMessage] = useState("");

  async function validatePostalCode(codeToValidate: string) {
    const code = formatPostalCode(codeToValidate);
    if (!/^\d{4}-\d{3}$/.test(code)) return;
    if (lastValidatedCode.current === code && state === "valid") return;

    const currentRequest = ++requestId.current;
    setState("loading");
    setMessage("A procurar a morada…");

    try {
      const prefix = code.replace(/\D/g, "").slice(0, 3);
      const shard = await loadPostalShard(prefix);
      const entry = shard[code];

      if (currentRequest !== requestId.current) return;
      if (!entry) throw new Error("Código postal não encontrado.");

      const streetOptions = uniqueStrings(entry.ruas);
      const returnedStreet = streetOptions[0] ?? "";
      const returnedCity = (entry.localidade || entry.designacaoPostal || "").trim();

      setRuas(streetOptions);
      setRua(returnedStreet);
      setCidade(returnedCity);
      lastValidatedCode.current = code;
      setState("valid");

      if (streetOptions.length > 1) {
        setMessage("Código postal encontrado. Confirme a rua correta na lista apresentada.");
      } else if (returnedStreet && returnedCity) {
        setMessage("Rua e localidade preenchidas automaticamente. Confirme os dados.");
      } else if (returnedCity) {
        setMessage("Localidade preenchida. Este código postal não identifica uma rua única; preencha a rua.");
      } else {
        setMessage("Código postal encontrado. Confirme e complete a morada.");
      }
    } catch (error) {
      if (currentRequest !== requestId.current) return;
      setRuas([]);
      setRua("");
      setCidade("");
      setState("invalid");
      setMessage(error instanceof Error && error.message.includes("indisponível")
        ? "A base de códigos postais não ficou disponível. Atualize a página e tente novamente."
        : "Código postal não encontrado. Confirme os sete algarismos ou preencha a morada manualmente.");
    }
  }

  useEffect(() => {
    if (!/^\d{4}-\d{3}$/.test(codigoPostal)) return;
    const timer = window.setTimeout(() => {
      void validatePostalCode(codigoPostal);
    }, 350);
    return () => window.clearTimeout(timer);
    // A validação só deve voltar a correr quando o código postal muda.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codigoPostal]);

  const statusClass = state === "valid"
    ? "text-emerald-700"
    : state === "invalid"
      ? "text-red-700"
      : "text-black/60";

  return <>
    <label className="text-sm font-semibold sm:col-span-2">Código postal
      <input
        name={fieldName("codigoPostal")}
        value={codigoPostal}
        placeholder="0000-000"
        inputMode="numeric"
        autoComplete="postal-code"
        required={obrigatorio}
        pattern="[0-9]{4}-[0-9]{3}"
        className={`${input} mt-2`}
        onChange={(event) => {
          const nextCode = formatPostalCode(event.target.value);
          setCodigoPostal(nextCode);
          lastValidatedCode.current = "";
          requestId.current += 1;
          setState("idle");
          setMessage(/^\d{4}-\d{3}$/.test(nextCode) ? "A iniciar pesquisa automática…" : "");
        }}
      />
    </label>

    {message && <p className={`sm:col-span-2 -mt-1 text-sm ${statusClass}`} role="status" aria-live="polite">{message}</p>}

    <label className="text-sm font-semibold sm:col-span-2">Rua
      <input
        name={fieldName("rua")}
        value={rua}
        onChange={(event) => setRua(event.target.value)}
        list={ruas.length > 1 ? `${listId}-ruas` : undefined}
        required={obrigatorio}
        className={`${input} mt-2`}
        autoComplete="address-line1"
        placeholder="Rua"
      />
      {ruas.length > 1 && <datalist id={`${listId}-ruas`}>{ruas.map((street) => <option key={street} value={street} />)}</datalist>}
    </label>

    <label className="text-sm font-semibold">Número da porta
      <input name={fieldName("numeroPorta")} defaultValue={valores.numeroPorta} required={obrigatorio} className={`${input} mt-2`} autoComplete="address-line2" />
    </label>
    <label className="text-sm font-semibold">Andar <span className="font-normal text-black/50">(opcional)</span>
      <input name={fieldName("andar")} defaultValue={valores.andar} placeholder="Ex.: 2.º" className={`${input} mt-2`} autoComplete="address-line2" />
    </label>
    <label className="text-sm font-semibold">Lado da porta <span className="font-normal text-black/50">(opcional)</span>
      <input name={fieldName("ladoPorta")} defaultValue={valores.ladoPorta} placeholder="Ex.: Direito" className={`${input} mt-2`} autoComplete="address-line3" />
    </label>
    <label className="text-sm font-semibold">Localidade
      <input name={fieldName("cidade")} value={cidade} onChange={(event) => setCidade(event.target.value)} required={obrigatorio} className={`${input} mt-2`} autoComplete="address-level2" />
    </label>
  </>;
}
