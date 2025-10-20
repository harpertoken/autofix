import { SettingsPanel } from '../SettingsPanel';
import { ThemeProvider } from '../ThemeProvider';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useWritingSettings } from '@/hooks/useWritingSettings';

export default function SettingsPanelExample() {
  const [isOpen, setIsOpen] = useState(true);
  const {
    autoSave,
    setAutoSave,
    completionMode,
    setCompletionMode,
    writingStyle,
    setWritingStyle,
  } = useWritingSettings();

  return (
    <ThemeProvider>
      <div className="relative h-96">
        <Button onClick={() => setIsOpen(true)}>Open Settings</Button>
        <SettingsPanel
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          autoSave={autoSave}
          onAutoSaveChange={setAutoSave}
          completionMode={completionMode}
          onCompletionModeChange={setCompletionMode}
          writingStyle={writingStyle}
          onWritingStyleChange={setWritingStyle}
        />
      </div>
    </ThemeProvider>
  );
}
