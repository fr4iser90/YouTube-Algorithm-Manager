import React from 'react';

// Neue Komponente für Profil-Auswahl
interface ProfileSelectModalProps {
    profiles: any[];
    onSelect: (profile: any) => void;
    onCreate: () => void;
    onClose: () => void;
  }

export const ProfileSelectModal: React.FC<ProfileSelectModalProps> = ({ profiles, onSelect, onCreate, onClose }) => (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-white mb-4">Profil auswählen</h3>
        <p className="text-gray-300 mb-4">Bitte wähle ein Profil aus oder erstelle ein neues, bevor du fortfährst.</p>
        <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
          {profiles.length === 0 && <div className="text-gray-400">Keine Profile vorhanden.</div>}
          {profiles.map((profile: any) => (
            <button
              key={profile.id}
              onClick={() => onSelect(profile)}
              className="w-full text-left px-4 py-2 bg-gray-700 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              {profile.name}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={onCreate}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
          >
            Neues Profil erstellen
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
  