export default function TermsPage() {
  return (
    <div className="min-h-screen particle-bg py-8 md:py-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="glass-panel-dark rounded-lg p-6 md:p-10 border border-gold-dim/30">
          <h1 className="font-title text-2xl md:text-4xl text-gold mb-6">Condiciones del Servicio</h1>
          <div className="font-body text-parchment/80 space-y-4 text-sm md:text-base">
            <p><strong className="text-parchment">Última actualización:</strong> 2 de abril de 2026</p>

            <h2 className="font-heading text-lg text-gold mt-6">1. Aceptación</h2>
            <p>Al usar RPG Hub aceptás estas condiciones. Si no estás de acuerdo, no uses el servicio.</p>

            <h2 className="font-heading text-lg text-gold mt-6">2. Descripción del servicio</h2>
            <p>RPG Hub es una plataforma de juego de rol digital con un Director de Mesa (DM) autónomo impulsado por inteligencia artificial. El servicio genera contenido narrativo dinámico basado en las acciones del jugador.</p>

            <h2 className="font-heading text-lg text-gold mt-6">3. Cuentas</h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Sos responsable de mantener la seguridad de tu cuenta</li>
              <li>Debés proporcionar información precisa al registrarte</li>
              <li>No podés compartir tu cuenta con terceros</li>
            </ul>

            <h2 className="font-heading text-lg text-gold mt-6">4. Uso aceptable</h2>
            <p>No debés usar el servicio para:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Actividades ilegales o dañinas</li>
              <li>Intentar explotar o hackear el sistema</li>
              <li>Generar contenido ofensivo intencionalmente</li>
            </ul>

            <h2 className="font-heading text-lg text-gold mt-6">5. Contenido generado por IA</h2>
            <p>El contenido narrativo es generado por inteligencia artificial y puede contener imprecisiones. RPG Hub no se responsabiliza por el contenido generado automáticamente.</p>

            <h2 className="font-heading text-lg text-gold mt-6">6. Limitación de responsabilidad</h2>
            <p>El servicio se proporciona "tal cual". No garantizamos disponibilidad ininterrumpida ni la preservación indefinida de datos de partidas.</p>

            <h2 className="font-heading text-lg text-gold mt-6">7. Contacto</h2>
            <p>Para consultas: <span className="text-gold">amir@amirgomez.com</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
