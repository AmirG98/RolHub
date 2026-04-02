export default function PrivacyPage() {
  return (
    <div className="min-h-screen particle-bg py-8 md:py-16">
      <div className="max-w-3xl mx-auto px-4">
        <div className="glass-panel-dark rounded-lg p-6 md:p-10 border border-gold-dim/30">
          <h1 className="font-title text-2xl md:text-4xl text-gold mb-6">Política de Privacidad</h1>
          <div className="font-body text-parchment/80 space-y-4 text-sm md:text-base">
            <p><strong className="text-parchment">Última actualización:</strong> 2 de abril de 2026</p>

            <h2 className="font-heading text-lg text-gold mt-6">1. Información que recopilamos</h2>
            <p>RPG Hub recopila la siguiente información cuando usás nuestro servicio:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Nombre de usuario y dirección de email (al registrarte)</li>
              <li>Datos de tu personaje y progreso de campaña</li>
              <li>Historial de partidas y decisiones narrativas</li>
            </ul>

            <h2 className="font-heading text-lg text-gold mt-6">2. Cómo usamos tu información</h2>
            <p>Usamos tu información exclusivamente para:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Proveer el servicio de juego de rol digital</li>
              <li>Guardar tu progreso y personajes</li>
              <li>Mejorar la experiencia del juego</li>
            </ul>

            <h2 className="font-heading text-lg text-gold mt-6">3. Compartir información</h2>
            <p>No vendemos ni compartimos tu información personal con terceros. Los servicios de terceros que usamos (autenticación, base de datos, IA) procesan datos según sus propias políticas de privacidad.</p>

            <h2 className="font-heading text-lg text-gold mt-6">4. Seguridad</h2>
            <p>Protegemos tu información con encriptación y prácticas de seguridad estándar de la industria.</p>

            <h2 className="font-heading text-lg text-gold mt-6">5. Tus derechos</h2>
            <p>Podés solicitar la eliminación de tu cuenta y datos en cualquier momento contactándonos.</p>

            <h2 className="font-heading text-lg text-gold mt-6">6. Contacto</h2>
            <p>Para consultas sobre privacidad: <span className="text-gold">soporte@rol-hub.com</span></p>
          </div>
        </div>
      </div>
    </div>
  )
}
