import React, { useMemo, useRef } from 'react';
import { Player, BenchPlayer, TeamColor } from '../types';

interface PaymentTrackerProps {
  players: Player[];
  benchPlayers: BenchPlayer[];
  feePerPlayer: number;
  playerPayments: Record<number, boolean>;
  onUpdatePayment: (playerId: number, isPaid: boolean) => void;
  onBackToField: () => void;
  onImportMatch: (matchDataString: string) => void;
  matchInfo: { location: string; date: string } | null;
}

const PlayerPaymentList: React.FC<{
    title: string;
    players: (Player | BenchPlayer)[];
    playerPayments: Record<number, boolean>;
    onUpdatePayment: (playerId: number, isPaid: boolean) => void;
}> = ({ title, players, playerPayments, onUpdatePayment }) => (
    <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 shadow-md">
        <h3 className="text-xl font-bold text-center text-green-400 mb-4">{title}</h3>
        <ul className="space-y-3">
            {players.map(player => (
                <li key={player.id} className="flex items-center justify-between bg-gray-900/50 p-3 rounded-lg shadow-md">
                    <span className="font-semibold text-gray-200">{player.name}</span>
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only"
                            checked={!!playerPayments[player.id]}
                            onChange={e => onUpdatePayment(player.id, e.target.checked)}
                        />
                        <div className={`w-11 h-6 rounded-full transition-colors ${playerPayments[player.id] ? 'bg-green-500' : 'bg-gray-600'}`}>
                            <div className={`w-4 h-4 bg-white rounded-full m-1 transform transition-transform ${playerPayments[player.id] ? 'translate-x-5' : ''}`}></div>
                        </div>
                    </label>
                </li>
            ))}
        </ul>
    </div>
);

const PaymentTracker: React.FC<PaymentTrackerProps> = ({
  players,
  benchPlayers,
  feePerPlayer,
  playerPayments,
  onUpdatePayment,
  onBackToField,
  onImportMatch,
  matchInfo,
}) => {
    const importInputRef = useRef<HTMLInputElement>(null);

    const { team1, team2 } = useMemo(() => {
        const team1Color = players.find(p => p.y > 50)?.teamId || 'blue';
        const team2Color = players.find(p => p.y <= 50)?.teamId || 'red';
        const allPlayers = [...players, ...benchPlayers];
        return {
            team1: allPlayers.filter(p => p.teamId === team1Color),
            team2: allPlayers.filter(p => p.teamId === team2Color),
        };
    }, [players, benchPlayers]);
    
    const { paidCount, totalCollected, remainingCount, remainingAmount, totalAmount } = useMemo(() => {
        const allPlayers = [...players, ...benchPlayers];
        const paidCount = Object.values(playerPayments).filter(p => p).length;
        const totalCollected = paidCount * feePerPlayer;
        const totalPlayers = allPlayers.length;
        const remainingCount = totalPlayers - paidCount;
        const remainingAmount = remainingCount * feePerPlayer;
        const totalAmount = totalPlayers * feePerPlayer;
        return { paidCount, totalCollected, remainingCount, remainingAmount, totalAmount };
    }, [players, benchPlayers, playerPayments, feePerPlayer]);
    
    const formatCurrency = (amount: number) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(amount);

    const handleShare = async () => {
        const matchState = { players, benchPlayers, matchInfo, feePerPlayer, playerPayments };
        const blob = new Blob([JSON.stringify(matchState, null, 2)], { type: 'application/json' });
        const file = new File([blob], `pagos-${matchInfo?.location.replace(/\s+/g, '-') || 'partido'}.json`, { type: 'application/json' });

        if (navigator.share && navigator.canShare({ files: [file] })) {
            try {
                await navigator.share({
                    title: 'Estado de Pagos del Partido',
                    text: `Lista de pagos para el partido en ${matchInfo?.location}.`,
                    files: [file],
                });
            } catch (error) { if ((error as Error).name !== 'AbortError') console.error('Error sharing:', error); }
        } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result;
                if (typeof text === 'string') onImportMatch(text);
            };
            reader.readAsText(file);
        }
        if (event.target) event.target.value = '';
    };

    return (
         <div className="bg-gray-800/50 p-6 md:p-8 rounded-xl shadow-2xl border border-gray-700 animate-fade-in w-full max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-green-400">Gestión de Pagos</h2>
                <button onClick={onBackToField} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.793 2.232a.75.75 0 01-.026 1.06L3.636 7.25h6.114a4.25 4.25 0 010 8.5H8a.75.75 0 010-1.5h1.75a2.75 2.75 0 000-5.5H3.636l4.131 3.958a.75.75 0 11-1.036 1.084l-5.5-5.25a.75.75 0 010-1.084l5.5-5.25a.75.75 0 011.06.026Z" clipRule="evenodd" /></svg>
                    <span>Volver a la Cancha</span>
                </button>
            </div>

            <div className="bg-gray-900/50 p-4 rounded-lg text-center shadow-md">
                <p className="text-sm font-semibold text-gray-400">Cuota por Jugador</p>
                <p className="text-2xl font-bold text-white mt-1">{formatCurrency(feePerPlayer)}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PlayerPaymentList title="Equipo 1" players={team1} playerPayments={playerPayments} onUpdatePayment={onUpdatePayment} />
                <PlayerPaymentList title="Equipo 2" players={team2} playerPayments={playerPayments} onUpdatePayment={onUpdatePayment} />
            </div>

            <div className="bg-gray-900/50 p-6 rounded-lg space-y-4 shadow-md">
                <h3 className="text-xl font-bold text-center text-green-400 mb-4">Resumen de Pagos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="bg-gray-800 p-3 rounded-lg shadow-md"><p className="text-sm text-gray-400">Total Recaudado</p><p className="text-lg font-bold text-green-400">{formatCurrency(totalCollected)}</p></div>
                    <div className="bg-gray-800 p-3 rounded-lg shadow-md"><p className="text-sm text-gray-400">Total Cancha</p><p className="text-lg font-bold text-white">{formatCurrency(totalAmount)}</p></div>
                    <div className="bg-gray-800 p-3 rounded-lg shadow-md"><p className="text-sm text-gray-400">Faltan por Pagar</p><p className="text-lg font-bold text-yellow-400">{remainingCount}</p></div>
                    <div className="bg-gray-800 p-3 rounded-lg shadow-md"><p className="text-sm text-gray-400">Monto Pendiente</p><p className="text-lg font-bold text-red-400">{formatCurrency(remainingAmount)}</p></div>
                </div>
            </div>

            <div className="border-t border-gray-700 pt-6 mt-6 flex flex-col sm:flex-row items-center gap-4 justify-end">
                <input type="file" ref={importInputRef} onChange={handleFileImport} className="hidden" accept=".json,application/json" />
                <button onClick={() => importInputRef.current?.click()} className="w-full sm:w-auto bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                    <span>Importar Lista</span>
                </button>
                <button onClick={handleShare} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" /></svg>
                    <span>Compartir Lista</span>
                </button>
            </div>
         </div>
    );
};

export default PaymentTracker;