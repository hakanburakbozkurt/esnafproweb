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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
