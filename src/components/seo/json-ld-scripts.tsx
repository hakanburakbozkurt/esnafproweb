// JSON içindeki "<" gibi karakterler <script> bloğunu kapatabilir; kaçışla güvenli hale getirilir.
function serializeJsonLd(schema: Record<string, unknown>) {
  return JSON.stringify(schema)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function JsonLdScripts({
  schemas,
}: {
  schemas: Array<Record<string, unknown> | null | undefined>;
}) {
  const validSchemas = schemas.filter(
    (schema): schema is Record<string, unknown> => Boolean(schema)
  );

  if (!validSchemas.length) return null;

  return (
    <>
      {validSchemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
        />
      ))}
    </>
  );
}
