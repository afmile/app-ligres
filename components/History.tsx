import React from 'react';
import { Match } from '../types';

interface HistoryProps {
    history: Match[];
    onLoadMatch: (match: Match) => void;
    onExportMatch: (match: Match) => void;
    onBack: () => void;
    onClearHistory: () => void;
}

const History: React.FC<HistoryProps> = ({ history, onLoadMatch, onExportMatch, onBack, onClearHistory }) => {
    
    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return new Intl.DateTimeFormat('es-ES', { dateStyle: 'full' }).format(date);
    };

    return (
        <div className="bg-gray-800/50 p-6 md:p-8 rounded-xl shadow-2xl border border-gray-700 animate-fade-in w-full max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-green-400">Historial de Partidos</h2>
                <button onClick={onBack} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                    &larr; Volver
                </button>
            </div>

            {history.length > 0 ? (
                <div className="space-y-4">
                    {history.map(match => (
                        <div key={match.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 hover:bg-gray-700/50 hover:border-gray-600 transition-all duration-200">
                            <div className="flex-grow">
                                <p className="font-bold text-lg text-white">{match.location}</p>
                                <p className="text-sm text-gray-400">{formatDate(match.date)}</p>
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <button onClick={() => onExportMatch(match)} className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors">
                                    Exportar a Texto
                                </button>
                                <button onClick={() => onLoadMatch(match)} className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2 rounded-md text-sm transition-colors">
                                    Cargar
                                </button>
                            </div>
                        </div>
                    ))}
                    <div className="text-center mt-6">
                         <button onClick={() => {
                             if(confirm('¿Estás seguro de que quieres borrar todo el historial? Esta acción no se puede deshacer.')) {
                                 onClearHistory();
                             }
                         }} className="text-red-500 hover:text-red-400 font-semibold text-sm">
                            Limpiar Historial
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">No tienes partidos guardados en tu historial.</p>
                    <p className="text-gray-500 mt-2">Completa una configuración para que aparezca aquí.</p>
                </div>
            )}
        </div>
    );
};

export default History;