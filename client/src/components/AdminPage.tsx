import { useState, useEffect } from 'react';
import type { AdminConfig, CardConfig } from '../types/config';

export function AdminPage() {
  const [config, setConfig] = useState<AdminConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch('/api/admin/config');
        if (!response.ok) {
          throw new Error(`Failed to fetch config: ${response.status}`);
        }
        const data = await response.json();
        setConfig(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch('/api/admin/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      if (!response.ok) {
        throw new Error(`Failed to save config: ${response.status}`);
      }
      setSuccessMessage('Configuration saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  const toggleCard = (cardId: string) => {
    if (!config) return;
    setConfig({
      ...config,
      availableCards: config.availableCards.map(card =>
        card.id === cardId ? { ...card, enabled: !card.enabled } : card
      ),
    });
  };

  const updateIntervalRange = (field: 'min' | 'max' | 'default', value: number) => {
    if (!config) return;
    setConfig({
      ...config,
      intervalRange: { ...config.intervalRange, [field]: value },
    });
  };

  const updateItemsPerPage = (field: 'schedule' | 'drivers' | 'constructors', value: number) => {
    if (!config) return;
    setConfig({
      ...config,
      itemsPerPage: { ...config.itemsPerPage, [field]: value },
    });
  };

  const toggleFeature = (feature: keyof AdminConfig['features']) => {
    if (!config) return;
    setConfig({
      ...config,
      features: { ...config.features, [feature]: !config.features[feature] },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-f1-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-f1-accent-red border-t-transparent mb-2" />
          <div className="text-f1-text-secondary text-sm">Loading config...</div>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-f1-bg-primary flex items-center justify-center">
        <div className="text-f1-accent-red">Failed to load configuration</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-f1-bg-primary p-8 overflow-auto">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-f1-text-primary">Admin Configuration</h1>
          <span className="px-2 py-1 text-xs bg-f1-accent-red text-white rounded">DEV ONLY</span>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-500 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-900/30 border border-green-500 rounded-lg text-green-300 text-sm">
            {successMessage}
          </div>
        )}

        {/* Available Cards */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-f1-text-primary mb-4">Available Cards</h2>
          <div className="bg-f1-bg-secondary rounded-lg p-4 space-y-3">
            {config.availableCards.map((card: CardConfig) => (
              <label
                key={card.id}
                className="flex items-center justify-between p-3 bg-f1-bg-tertiary rounded-lg cursor-pointer hover:bg-f1-border transition-colors"
              >
                <span className="text-f1-text-primary">{card.label}</span>
                <input
                  type="checkbox"
                  checked={card.enabled}
                  onChange={() => toggleCard(card.id)}
                  className="w-5 h-5 accent-f1-accent-red"
                />
              </label>
            ))}
          </div>
        </section>

        {/* Interval Range */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-f1-text-primary mb-4">Rotation Interval (ms)</h2>
          <div className="bg-f1-bg-secondary rounded-lg p-4 space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-f1-text-secondary text-sm mb-2">Minimum</label>
                <input
                  type="number"
                  value={config.intervalRange.min}
                  onChange={(e) => updateIntervalRange('min', parseInt(e.target.value) || 0)}
                  className="w-full p-2 bg-f1-bg-tertiary border border-f1-border rounded text-f1-text-primary"
                />
              </div>
              <div>
                <label className="block text-f1-text-secondary text-sm mb-2">Maximum</label>
                <input
                  type="number"
                  value={config.intervalRange.max}
                  onChange={(e) => updateIntervalRange('max', parseInt(e.target.value) || 0)}
                  className="w-full p-2 bg-f1-bg-tertiary border border-f1-border rounded text-f1-text-primary"
                />
              </div>
              <div>
                <label className="block text-f1-text-secondary text-sm mb-2">Default</label>
                <input
                  type="number"
                  value={config.intervalRange.default}
                  onChange={(e) => updateIntervalRange('default', parseInt(e.target.value) || 0)}
                  className="w-full p-2 bg-f1-bg-tertiary border border-f1-border rounded text-f1-text-primary"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Items Per Page */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-f1-text-primary mb-4">Items Per Page</h2>
          <div className="bg-f1-bg-secondary rounded-lg p-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-f1-text-secondary text-sm mb-2">Schedule</label>
                <input
                  type="number"
                  value={config.itemsPerPage.schedule}
                  onChange={(e) => updateItemsPerPage('schedule', parseInt(e.target.value) || 1)}
                  min={1}
                  className="w-full p-2 bg-f1-bg-tertiary border border-f1-border rounded text-f1-text-primary"
                />
              </div>
              <div>
                <label className="block text-f1-text-secondary text-sm mb-2">Drivers</label>
                <input
                  type="number"
                  value={config.itemsPerPage.drivers}
                  onChange={(e) => updateItemsPerPage('drivers', parseInt(e.target.value) || 1)}
                  min={1}
                  className="w-full p-2 bg-f1-bg-tertiary border border-f1-border rounded text-f1-text-primary"
                />
              </div>
              <div>
                <label className="block text-f1-text-secondary text-sm mb-2">Constructors</label>
                <input
                  type="number"
                  value={config.itemsPerPage.constructors}
                  onChange={(e) => updateItemsPerPage('constructors', parseInt(e.target.value) || 1)}
                  min={1}
                  className="w-full p-2 bg-f1-bg-tertiary border border-f1-border rounded text-f1-text-primary"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Feature Flags */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-f1-text-primary mb-4">Feature Flags</h2>
          <div className="bg-f1-bg-secondary rounded-lg p-4 space-y-3">
            <label className="flex items-center justify-between p-3 bg-f1-bg-tertiary rounded-lg cursor-pointer hover:bg-f1-border transition-colors">
              <span className="text-f1-text-primary">Allow Card Reordering</span>
              <input
                type="checkbox"
                checked={config.features.allowReordering}
                onChange={() => toggleFeature('allowReordering')}
                className="w-5 h-5 accent-f1-accent-red"
              />
            </label>
            <label className="flex items-center justify-between p-3 bg-f1-bg-tertiary rounded-lg cursor-pointer hover:bg-f1-border transition-colors">
              <span className="text-f1-text-primary">Allow Interval Change</span>
              <input
                type="checkbox"
                checked={config.features.allowIntervalChange}
                onChange={() => toggleFeature('allowIntervalChange')}
                className="w-5 h-5 accent-f1-accent-red"
              />
            </label>
            <label className="flex items-center justify-between p-3 bg-f1-bg-tertiary rounded-lg cursor-pointer hover:bg-f1-border transition-colors">
              <span className="text-f1-text-primary">Show User Config Menu</span>
              <input
                type="checkbox"
                checked={config.features.showUserConfigMenu}
                onChange={() => toggleFeature('showUserConfigMenu')}
                className="w-5 h-5 accent-f1-accent-red"
              />
            </label>
          </div>
        </section>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-3 bg-f1-accent-red text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? 'Saving...' : 'Save Configuration'}
          </button>
          <a
            href="/"
            className="px-6 py-3 bg-f1-bg-tertiary text-f1-text-primary rounded-lg hover:bg-f1-border transition-colors text-center"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
