import React, { useState } from 'react';

interface AccordionItemProps {
    title: string;
    children: React.ReactNode;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border-b border-gray-700">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center text-left py-4 px-2 focus:outline-none focus-visible:ring focus-visible:ring-green-500 focus-visible:ring-opacity-75"
                aria-expanded={isOpen}
            >
                <span className="text-lg font-semibold text-gray-100">{title}</span>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-6 w-6 transform transition-transform text-gray-400 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="px-2 pb-4 text-gray-300 space-y-2 animate-fade-in">
                    {children}
                </div>
            )}
        </div>
    );
};


const Help: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    return (
        <div className="bg-gray-800/50 p-6 md:p-8 rounded-xl shadow-2xl border border-gray-700 animate-fade-in w-full max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-green-400">Sección de Ayuda</h2>
                <button onClick={onBack} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    &larr; Volver
                </button>
            </div>

            <div className="space-y-2">
                <AccordionItem title="1. Configuración del Partido">
                    <p>En la pantalla principal, puedes definir todos los detalles de tu partido:</p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                        <li><strong>Lugar y Fecha:</strong> Ingresa dónde y cuándo se jugará. Estos datos se usarán para el historial y las exportaciones. Puedes usar "Lugares recientes" para autocompletar.</li>
                        <li><strong>Tamaño del Equipo:</strong> Elige entre 6 o 7 jugadores. La aplicación ajustará las posiciones disponibles automáticamente.</li>
                        <li><strong>Banca de Suplentes:</strong> Activa esta opción para añadir jugadores suplentes a cada equipo.</li>
                        <li><strong>Cuota por Jugador:</strong> Opcionalmente, activa esta función para gestionar los pagos de la cancha. Ingresa el monto que cada jugador debe pagar.</li>
                    </ul>
                </AccordionItem>
                
                <AccordionItem title="2. La Pizarra Táctica">
                    <p>Una vez que configuras el partido y presionas "Distribuir jugadores", llegarás a la cancha:</p>
                     <ul className="list-disc list-inside ml-4 space-y-1">
                        <li><strong>Mover Jugadores:</strong> Haz clic (o mantén presionado en el móvil) y arrastra el ícono de un jugador para cambiar su posición en el campo.</li>
                        <li><strong>Editar Nombres:</strong> Haz clic sobre el nombre de un jugador para editarlo directamente en la cancha. Presiona 'Enter' o haz clic fuera para guardar.</li>
                    </ul>
                </AccordionItem>
                
                <AccordionItem title="3. ¿Cómo funcionan las opciones para compartir?">
                    <p>La aplicación ofrece tres formas distintas de compartir la información del partido, cada una con un propósito diferente:</p>
                    <div className="space-y-4 mt-2">
                        <div className="bg-gray-900/50 p-3 rounded-lg">
                            <h4 className="font-bold text-green-400">Compartir Imagen</h4>
                            <p className="text-sm">Esta opción (disponible en la pantalla de la cancha) genera una imagen <strong className="text-white">visual (PNG)</strong> de la pizarra táctica. Es ideal para compartir en grupos de WhatsApp, redes sociales o donde quieras mostrar la alineación de forma gráfica y rápida.</p>
                        </div>
                         <div className="bg-gray-900/50 p-3 rounded-lg">
                            <h4 className="font-bold text-green-400">Exportar a Texto</h4>
                            <p className="text-sm">Esta opción (disponible en el Historial) crea un archivo de <strong className="text-white">texto plano (.txt)</strong>. Contiene un resumen detallado del partido: equipos, jugadores, posiciones, suplentes y el estado de los pagos (si está activado). Es perfecto para enviar un resumen claro y completo por correo o chat.</p>
                        </div>
                         <div className="bg-gray-900/50 p-3 rounded-lg">
                            <h4 className="font-bold text-green-400">Compartir / Importar Lista (Pagos)</h4>
                            <p className="text-sm">Esta opción (disponible en la pantalla de "Gestionar Pagos") exporta un archivo de <strong className="text-white">datos (.json)</strong>. Este archivo contiene TODA la información del partido en curso, incluyendo quién ha pagado. Su principal función es <strong className="text-white">sincronizar la información</strong>. Por ejemplo, puedes enviarle este archivo a la persona que administra los pagos, ella puede importarlo en su app, actualizar la lista y devolvértela.</p>
                        </div>
                    </div>
                </AccordionItem>

                <AccordionItem title="4. Integración con Calendario y Mapas">
                    <p>En la pantalla de la cancha, encontrarás botones para:</p>
                     <ul className="list-disc list-inside ml-4 space-y-1">
                        <li><strong>Añadir al calendario:</strong> Crea un evento en tu Google Calendar con los detalles del partido para que no lo olvides.</li>
                        <li><strong>Cómo llegar:</strong> Abre Google Maps con la ruta hacia la ubicación del partido que ingresaste.</li>
                    </ul>
                </AccordionItem>
                
                 <AccordionItem title="5. Historial de Partidos">
                    <p>Cada vez que completas una configuración, el partido se guarda automáticamente en tu historial. Desde allí puedes:</p>
                     <ul className="list-disc list-inside ml-4 space-y-1">
                        <li><strong>Cargar:</strong> Restaura una alineación y su información de un partido anterior.</li>
                        <li><strong>Exportar a Texto:</strong> Genera el resumen en .txt de ese partido específico.</li>
                        <li><strong>Limpiar Historial:</strong> Borra permanentemente todos los partidos guardados.</li>
                    </ul>
                </AccordionItem>

            </div>

             <div className="border-t border-gray-700 pt-6 mt-6">
                <h3 className="text-xl font-bold text-center text-green-400 mb-4">Soporte y Contacto</h3>
                <p className="text-center text-gray-300 mb-4">Si encuentras algún error, tienes alguna sugerencia, quieres dar tu feedback o necesitas ayuda, no dudes en contactarme.</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <a href="https://t.me/alfemile" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M9.78 18.65l.28-4.23l7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3L3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.57c-.28 1.1-.86 1.32-1.74 0.81L12.07 16.2l-1.87 1.82c-.24.24-.45.44-.88.44l.16.01z"/></svg>
                        Telegram
                    </a>
                     <a href="mailto:amiguielesl@gmail.com" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                           <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                           <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        Correo Electrónico
                    </a>
                </div>
            </div>

        </div>
    );
};

export default Help;