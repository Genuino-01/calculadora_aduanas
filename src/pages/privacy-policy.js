import Head from 'next/head';
import Link from 'next/link';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Head>
        <title>Política de Privacidad - Calculadora Impuestos de Vehículos RD</title>
        <meta name="description" content="Política de Privacidad de la Calculadora de Impuestos de Importación de Vehículos en República Dominicana." />
      </Head>

      <header className="bg-gradient-to-r from-dga-verde to-dga-verde-oscuro text-white p-6 shadow-md">
        <div className="container mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold text-dga-verde-suave">Política de Privacidad</h1>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl p-4 md:p-8 bg-dga-blanco rounded-xl shadow-xl my-8">
        <h2 className="text-2xl font-bold text-dga-verde-profundo mt-6 mb-3">Política de Privacidad</h2>
        <p className="mb-2 text-sm text-dga-gris-neutro">
          Esta es la página de la política de privacidad. Actualmente, esta calculadora no recopila información personal identificable de sus usuarios más allá de los datos técnicos estándar recopilados por cualquier sitio web (como direcciones IP anónimas para análisis de tráfico básico o cookies de sesión si son necesarias para la funcionalidad).
        </p>
        <p className="mb-2 text-sm text-dga-gris-neutro">
          Los datos ingresados en la calculadora (marca, modelo, año, etc.) se utilizan únicamente para realizar el cálculo solicitado y no se almacenan de forma persistente asociados a un usuario específico.
        </p>
        <p className="mb-2 text-sm text-dga-gris-neutro">
          Si se utilizan servicios de terceros como Google AdSense, estos pueden recopilar datos según sus propias políticas de privacidad. Le recomendamos revisar las políticas de dichos servicios.
        </p>
        <p className="mb-2 text-sm text-dga-gris-neutro">
          Esta política puede actualizarse en el futuro.
        </p>
        
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
