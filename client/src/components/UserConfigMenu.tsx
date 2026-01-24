import { useConfig } from '../hooks/useConfig';
import type { CardId } from '../types/config';
import type { EnrichedDriverStanding, ConstructorStanding } from '../types/f1';
import { TEAM_COLORS } from '../types/f1';

interface UserConfigMenuProps {
  isOpen: boolean;
  onClose: () => void;
  drivers?: EnrichedDriverStanding[];
  teams?: ConstructorStanding[];
}

function getTeamColor(teamName?: string, teamColour?: string): string {
  if (teamColour && !teamColour.startsWith('#')) return `#${teamColour}`;
  if (teamColour) return teamColour;
  if (teamName && TEAM_COLORS[teamName]) return TEAM_COLORS[teamName];
  return '#666666';
}

export function UserConfigMenu({ isOpen, onClose, drivers = [], teams = [] }: UserConfigMenuProps) {
  const { adminConfig, userConfig, updateUserConfig, resetUserConfig } = useConfig();

  if (!isOpen || !adminConfig) return null;

  const enabledCards = adminConfig.availableCards.filter(c => c.enabled);
  const { allowReordering, allowIntervalChange } = adminConfig.features;

  const toggleCard = (cardId: CardId) => {
    const isSelected = userConfig.selectedCards.includes(cardId);
    if (isSelected) {
      // Don't allow deselecting all cards
      if (userConfig.selectedCards.length <= 1) return;
      updateUserConfig({
        selectedCards: userConfig.selectedCards.filter(id => id !== cardId),
      });
    } else {
      updateUserConfig({
        selectedCards: [...userConfig.selectedCards, cardId],
      });
    }
  };

  const moveCard = (cardId: CardId, direction: 'up' | 'down') => {
    const index = userConfig.cardOrder.indexOf(cardId);
    if (index === -1) return;

    const newOrder = [...userConfig.cardOrder];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    if (newIndex < 0 || newIndex >= newOrder.length) return;

    // Swap positions
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    updateUserConfig({ cardOrder: newOrder });
  };

  const handleIntervalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      updateUserConfig({ interval: value });
    }
  };

  // Order the enabled cards according to user's cardOrder
  const orderedCards = [...enabledCards].sort((a, b) => {
    const aIndex = userConfig.cardOrder.indexOf(a.id);
    const bIndex = userConfig.cardOrder.indexOf(b.id);
    return aIndex - bIndex;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        className="bg-f1-bg-secondary rounded-xl p-6 w-[400px] max-w-[90vw] max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-f1-text-primary">Dashboard Settings</h2>
          <button
            onClick={onClose}
            className="p-1 text-f1-text-secondary hover:text-f1-text-primary transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Card Selection & Ordering */}
        <section className="mb-6">
          <h3 className="text-sm font-medium text-f1-text-secondary mb-3">
            {allowReordering ? 'Select & Reorder Cards' : 'Select Cards'}
          </h3>
          <div className="space-y-2">
            {orderedCards.map((card, index) => {
              const isSelected = userConfig.selectedCards.includes(card.id);
              return (
                <div
                  key={card.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isSelected ? 'bg-f1-bg-tertiary' : 'bg-f1-bg-primary opacity-60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleCard(card.id)}
                    className="w-4 h-4 accent-f1-accent-red"
                    disabled={isSelected && userConfig.selectedCards.length <= 1}
                  />
                  <span className="flex-1 text-f1-text-primary text-sm">{card.label}</span>
                  {allowReordering && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveCard(card.id, 'up')}
                        disabled={index === 0}
                        className="p-1 text-f1-text-secondary hover:text-f1-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Move up"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => moveCard(card.id, 'down')}
                        disabled={index === orderedCards.length - 1}
                        className="p-1 text-f1-text-secondary hover:text-f1-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        aria-label="Move down"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Interval Setting */}
        {allowIntervalChange && (
          <section className="mb-6">
            <h3 className="text-sm font-medium text-f1-text-secondary mb-3">
              Rotation Interval
            </h3>
            <div className="bg-f1-bg-tertiary rounded-lg p-4">
              <input
                type="range"
                min={adminConfig.intervalRange.min}
                max={adminConfig.intervalRange.max}
                value={userConfig.interval}
                onChange={handleIntervalChange}
                className="w-full accent-f1-accent-red"
              />
              <div className="flex justify-between mt-2 text-xs text-f1-text-secondary">
                <span>{adminConfig.intervalRange.min / 1000}s</span>
                <span className="text-f1-text-primary font-medium">{userConfig.interval / 1000}s</span>
                <span>{adminConfig.intervalRange.max / 1000}s</span>
              </div>
            </div>
          </section>
        )}

        {/* Favorite Driver Selection */}
        {userConfig.selectedCards.includes('driverCard') && drivers.length > 0 && (
          <section className="mb-6">
            <h3 className="text-sm font-medium text-f1-text-secondary mb-3">
              Favorite Driver
            </h3>
            <div className="bg-f1-bg-tertiary rounded-lg p-2 max-h-48 overflow-y-auto">
              {drivers.map((driver) => {
                const isSelected = userConfig.favoriteDriverNumber === driver.driver_number;
                const teamColor = getTeamColor(driver.team_name, driver.team_colour);
                return (
                  <button
                    key={driver.driver_number}
                    onClick={() => updateUserConfig({ favoriteDriverNumber: driver.driver_number })}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-f1-bg-secondary ring-1 ring-f1-accent-red'
                        : 'hover:bg-f1-bg-secondary'
                    }`}
                  >
                    <div
                      className="w-1 h-6 rounded-full flex-shrink-0"
                      style={{ backgroundColor: teamColor }}
                    />
                    <span className="text-xs font-mono text-f1-text-muted w-6">
                      #{driver.driver_number}
                    </span>
                    <span className="flex-1 text-sm text-f1-text-primary text-left truncate">
                      {driver.full_name || driver.broadcast_name}
                    </span>
                    {isSelected && (
                      <svg className="w-4 h-4 text-f1-accent-red flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Favorite Team Selection */}
        {userConfig.selectedCards.includes('teamCard') && teams.length > 0 && (
          <section className="mb-6">
            <h3 className="text-sm font-medium text-f1-text-secondary mb-3">
              Favorite Team
            </h3>
            <div className="bg-f1-bg-tertiary rounded-lg p-2 max-h-48 overflow-y-auto">
              {teams.map((team) => {
                const isSelected = userConfig.favoriteTeam === team.team_name;
                const teamColor = getTeamColor(team.team_name, team.team_colour);
                return (
                  <button
                    key={team.team_name}
                    onClick={() => updateUserConfig({ favoriteTeam: team.team_name })}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-f1-bg-secondary ring-1 ring-f1-accent-red'
                        : 'hover:bg-f1-bg-secondary'
                    }`}
                  >
                    <div
                      className="w-3 h-6 rounded flex-shrink-0"
                      style={{ backgroundColor: teamColor }}
                    />
                    <span className="flex-1 text-sm text-f1-text-primary text-left truncate">
                      {team.team_name}
                    </span>
                    <span className="text-xs text-f1-text-muted">
                      P{team.position_current}
                    </span>
                    {isSelected && (
                      <svg className="w-4 h-4 text-f1-accent-red flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={resetUserConfig}
            className="flex-1 py-2 px-4 text-sm bg-f1-bg-tertiary text-f1-text-secondary rounded-lg hover:bg-f1-border hover:text-f1-text-primary transition-colors"
          >
            Reset to Defaults
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 text-sm bg-f1-accent-red text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
