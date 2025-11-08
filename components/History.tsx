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
        <div className="bg-surface/75 p-6 md:p-8 rounded-xl shadow-2xl border border-secondary/20 animate-fade-in w-full max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-primary">Historial de Partidos</h2>
                <button onClick={onBack} className="bg-surface hover:bg-surface/75 text-text-primary font-bold py-2 px-4 rounded-lg transition-colors">
                    &larr; Volver
                </button>
            </div>

            {history.length > 0 ? (
                <div className="space-y-4">
                    {history.map(match => (
                        <div key={match.id} className="bg-surface p-4 rounded-lg border border-secondary/20 flex flex-col sm:flex-row justify-between items-center gap-4 hover:bg-surface/75 hover:border-secondary/30 transition-all duration-200 shadow-md">
                            <div className="flex-grow">
                                <p className="font-bold text-lg text-text-primary">{match.location}</p>
                                <p className="text-sm text-text-secondary">{formatDate(match.date)}</p>
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <button onClick={() => onExportMatch(match)} className="bg-secondary hover:bg-blue-400 text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors">
                                    Exportar a Texto
                                </button>
                                <button onClick={() => onLoadMatch(match)} className="bg-success hover:bg-green-600 text-white font-bold px-4 py-2 rounded-md text-sm transition-colors">
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
                         }} className="text-error hover:text-red-500 font-semibold text-sm">
                            Limpiar Historial
                        </button>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-text-secondary text-lg">No tienes partidos guardados en tu historial.</p>
                    <p className="text-text-secondary/75 mt-2">Completa una configuración para que aparezca aquí.</p>
                </div>
            )}
        </div>
    );
};

export default History;