const DisclaimerContent = ({ isFullPage = false }) => {
  const Heading = ({ children }) => isFullPage ? 
    <h2 className="text-2xl font-bold text-dga-verde-profundo mt-6 mb-3">{children}</h2> : 
    <h3 className="text-lg font-semibold text-dga-verde-profundo mt-4 mb-2">{children}</h3>;

  const Paragraph = ({ children }) => <p className="mb-2 text-sm text-dga-gris-neutro">{children}</p>;
  const ListItem = ({ children }) => <li className="mb-1 ml-4 text-sm text-dga-gris-neutro list-disc">{children}</li>;

  return (
    <>
      <Heading>⚠️ **IMPORTANTE - LEER ANTES DE USAR**</Heading>
      
      <Heading>Valores Aproximados</Heading>
      <Paragraph>
        Los cálculos mostrados son **estimaciones aproximadas** basadas en la base de datos oficial de la DGA. 
        Los valores reales pueden variar según condiciones específicas, fluctuaciones del mercado, y otros factores no contemplados en esta calculadora.
      </Paragraph>

      <Heading>Cálculos con Beneficios para Dealers</Heading>
      <Paragraph>
        Los cálculos presentados por esta herramienta reflejan los montos de impuestos y aranceles aplicando los beneficios y consideraciones especiales que podrían aplicar a dealers de vehículos debidamente registrados y autorizados en la República Dominicana.
      </Paragraph>
      <Paragraph>
        Estos beneficios pueden incluir tasas preferenciales o exenciones parciales bajo ciertos acuerdos o regulaciones específicas para importadores comerciales. La calculadora intenta modelar estos escenarios.
      </Paragraph>
      <Paragraph>
        Si usted no es un dealer registrado con dichos beneficios, los montos a pagar podrían ser diferentes. Consulte siempre con la DGA para obtener una cotización aplicable a su caso particular.
      </Paragraph>

      <Heading>Herramienta de Apoyo No Oficial</Heading>
      <ul>
        <ListItem>🔹 Esta calculadora es una **herramienta de apoyo** independiente</ListItem>
        <ListItem>🔹 **NO tiene relación oficial** con la Dirección General de Aduanas (DGA)</ListItem>
        <ListItem>🔹 Utiliza datos públicos de la base de datos oficial de la DGA como referencia</ListItem>
        <ListItem>🔹 Los resultados **no constituyen** cotizaciones oficiales ni documentos válidos para trámites aduaneros</ListItem>
      </ul>

      <Heading>Limitaciones Adicionales</Heading>
      <ul>
        <ListItem>📋 Las tasas de cambio se actualizan periódicamente pero pueden no reflejar el valor exacto al momento del trámite</ListItem>
        <ListItem>📋 Los costos de flete son estimaciones generales que pueden variar según origen, naviera y condiciones específicas</ListItem>
        <ListItem>📋 Algunos vehículos pueden tener clasificaciones especiales no contempladas en esta calculadora</ListItem>
        <ListItem>📋 Los montos de primera placa pueden variar según especificaciones técnicas exactas del vehículo</ListItem>
      </ul>

      <Heading>Uso Responsable</Heading>
      <Paragraph>
        Al utilizar esta herramienta, usted reconoce y acepta que:
      </Paragraph>
      <ul>
        <ListItem>Los cálculos son **referenciales únicamente**</ListItem>
        <ListItem>Debe **verificar todos los valores** con la DGA antes de realizar importaciones</ListItem>
        <ListItem>La herramienta **no sustituye** la consulta oficial con agentes aduaneros certificados</ListItem>
        <ListItem>El desarrollador **no se hace responsable** por decisiones comerciales basadas en estos cálculos</ListItem>
      </ul>

      <Heading>Recomendación Oficial</Heading>
      <Paragraph>
        Para obtener cotizaciones exactas y oficiales, siempre consulte directamente con:
      </Paragraph>
      <ul>
        <ListItem>🏛️ **Dirección General de Aduanas (DGA)**</ListItem>
        <ListItem>🏛️ **Agentes aduaneros certificados**</ListItem>
        <ListItem>🏛️ **Su asociación de dealers importadores**</ListItem>
      </ul>

      {isFullPage && (
        <>
          <hr className="my-6 border-dga-verde-menta" />
          <Paragraph><strong>📅 Última actualización:</strong> Junio 2025</Paragraph>
          <Paragraph><strong>🔄 Datos base:</strong> DGA República Dominicana</Paragraph>
          <Paragraph><strong>⚖️ Disclaimer:</strong> Este es un documento legal informativo</Paragraph>
        </>
      )}
    </>
  );
};

export default DisclaimerContent;
