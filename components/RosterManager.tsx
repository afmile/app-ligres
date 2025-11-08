import React, { useState } from 'react';
import { Roster } from '../types';

interface RosterManagerProps {
    rosters: Roster[];
    onSaveRoster: (roster: Roster) => void;
    onDeleteRoster: (rosterId: string) => void;
    onBack: () => void;
}

const RosterForm: React.FC<{
    roster: Roster | null;
    onSave: (roster: Roster) => void;
    onCancel: () => void;
}> = ({ roster, onSave, onCancel }) => {
    const [name, setName] = useState(roster?.name || '');
    const [playerNames, setPlayerNames] = useState(roster?.playerNames || ['']);

    const handlePlayerNameChange = (index: number, value: string) => {
        const newPlayerNames = [...playerNames];
        newPlayerNames[index] = value;
        setPlayerNames(newPlayerNames);
    };

    const addPlayer = () => {
        setPlayerNames([...playerNames, '']);
    };
    
    const removePlayer = (index: number) => {
        if (playerNames.length > 1) {
            setPlayerNames(playerNames.filter((_, i) => i !== index));
        }
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalRoster: Roster = {
            id: roster?.id || new Date().toISOString(),
            name: name.trim(),
            playerNames: playerNames.map(p => p.trim()).filter(p => p),
        };
        onSave(finalRoster);
    }

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
            <form onSubmit={handleSubmit} className="bg-surface p-6 rounded-xl border border-secondary/20 shadow-2xl w-full max-w-md space-y-4 animate-pop-in">
                <h3 className="text-xl font-bold text-primary">{roster ? 'Editar Plantilla' : 'Crear Nueva Plantilla'}</h3>
                <div>
                    <label htmlFor="roster-name" className="block text-sm font-medium text-text-secondary">Nombre de la Plantilla</label>
                    <input type="text" id="roster-name" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Equipo de los Martes" className="mt-1 w-full bg-background border border-secondary/20 rounded-md py-2 px-3 text-text-primary focus:outline-none focus:ring-2 focus:ring-primary shadow-inner" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-text-secondary">Jugadores</label>
                    <div className="mt-1 space-y-2 max-h-60 overflow-y-auto pr-2">
                        {playerNames.map((playerName, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <input type="text" value={playerName} onChange={e => handlePlayerNameChange(index, e.target.value)} placeholder={`Jugador ${index + 1}`} className="w-full bg-background border border-secondary/20 rounded-md py-2 px-3 text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary shadow-inner" />
                                <button type="button" onClick={() => removePlayer(index)} className="p-2 text-error hover:text-red-400 disabled:opacity-50" disabled={playerNames.length <= 1}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                     <button type="button" onClick={addPlayer} className="w-full mt-2 text-primary border-2 border-dashed border-secondary/20 rounded-lg py-2 hover:bg-surface/75 hover:border-primary transition flex items-center justify-center space-x-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
                        </svg>
                        <span>+ Jugador</span>
                    </button>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onCancel} className="bg-surface hover:bg-surface/75 text-text-primary font-bold py-2 px-4 rounded-lg transition-colors">Cancelar</button>
                    <button type="submit" className="bg-success text-black font-bold py-2 px-4 rounded-lg hover:bg-green-500 transition-colors">Guardar</button>
                </div>
            </form>
        </div>
    );
};

const RosterManager: React.FC<RosterManagerProps> = ({ rosters, onSaveRoster, onDeleteRoster, onBack }) => {
    const [editingRoster, setEditingRoster] = useState<Roster | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const handleSave = (roster: Roster) => {
        onSaveRoster(roster);
        setEditingRoster(null);
        setIsCreating(false);
    };

    return (
        <div className="bg-surface/75 p-6 md:p-8 rounded-xl shadow-2xl border border-secondary/20 animate-fade-in w-full max-w-4xl mx-auto">
            {(isCreating || editingRoster) && (
                <RosterForm 
                    roster={editingRoster} 
                    onSave={handleSave} 
                    onCancel={() => { setEditingRoster(null); setIsCreating(false); }}
                />
            )}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-primary">Gestión de Plantillas</h2>
                <button onClick={onBack} className="bg-surface hover:bg-surface/75 text-text-primary font-bold py-2 px-4 rounded-lg transition-colors">
                    &larr; Volver
                </button>
            </div>

            {rosters.length > 0 ? (
                <div className="space-y-4">
                    {rosters.map(roster => (
                        <div key={roster.id} className="bg-surface p-4 rounded-lg border border-secondary/20 flex flex-col sm:flex-row justify-between items-center gap-4 hover:bg-surface/75 hover:border-secondary/30 transition-all duration-200 shadow-md">
                            <div className="flex-grow">
                                <p className="font-bold text-lg text-text-primary">{roster.name}</p>
                                <p className="text-sm text-text-secondary">{roster.playerNames.length} jugadores</p>
                            </div>
                            <div className="flex-shrink-0 flex items-center gap-2">
                                <button onClick={() => setEditingRoster(roster)} className="bg-secondary hover:bg-blue-400 text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors">
                                    Editar
                                </button>
                                <button onClick={() => {
                                    if(confirm(`¿Seguro que quieres eliminar la plantilla "${roster.name}"?`)) {
                                        onDeleteRoster(roster.id);
                                    }
                                }} className="bg-error hover:bg-red-500 text-white font-bold px-4 py-2 rounded-md text-sm transition-colors">
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <p className="text-text-secondary text-lg">No tienes plantillas guardadas.</p>
                    <p className="text-text-secondary/75 mt-2">¡Crea una para empezar a reutilizar tus listas de jugadores!</p>
                </div>
            )}
            <div className="text-center mt-6">
                 <button onClick={() => setIsCreating(true)} className="bg-success hover:bg-green-500 text-black font-bold py-3 px-6 rounded-lg transition-colors shadow-lg">
                    Crear Nueva Plantilla
                </button>
            </div>
        </div>
    );
};

export default RosterManager;
