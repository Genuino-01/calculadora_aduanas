import Head from 'next/head';
import Link from 'next/link';
import DisclaimerContent from '../components/DisclaimerContent';

export default function TermsOfUsePage() {
  return (
    <>
      <Head>
        <title>Términos de Uso - Calculadora Impuestos de Vehículos RD</title>
        <meta name="description" content="Términos y Condiciones de Uso de la Calculadora de Impuestos de Importación de Vehículos en República Dominicana." />
      </Head>

      <header className="bg-gradient-to-r from-dga-verde to-dga-verde-oscuro text-white p-6 shadow-md">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-dga-verde-suave">Términos de Uso</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl p-4 md:p-8 bg-dga-blanco rounded-xl shadow-xl my-8">
        <DisclaimerContent isFullPage={true} />

        <div className="mt-8 text-center">
          <Link href="/" legacyBehavior>
            <a className="text-dga-verde-oscuro hover:text-dga-verde-profundo hover:underline">
              &larr; Volver a la Calculadora
            </a>
          </Link>
        </div>
      </main>

      <footer className="text-center p-4 mt-8 text-dga-gris-neutro text-sm">
        <p>&copy; {new Date().getFullYear()} Calculadora de Impuestos Aduanales RD. Valores referenciales.</p>
      </footer>
    </>
  );
}
