import { useEffect, useState } from 'react';
import { checkStatus } from '../lib/api';

export function StatusBar() {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    async function fetchStatus() {
      try {
        const data = await checkStatus();
        if (!mounted) return;
        setStatus(data.status === 'ok' ? 'ok' : 'error');
      } catch (error) {
        if (!mounted) return;
        setStatus('error');
        setErrorMessage(
          error instanceof Error ? error.message : 'Connection failed'
        );
      }
    }

    fetchStatus();

    const interval = setInterval(fetchStatus, 60000);

    return () => {
      clearInterval(interval);
      mounted = false;
    };
  }, []);

  const color =
    status === 'ok'
      ? 'bg-green-500'
      : status === 'error'
        ? 'bg-red-500'
        : 'bg-yellow-500';

  return (
    <div className="flex items-center justify-center py-1 bg-gray-100 dark:bg-gray-800 border-b">
      <div
        className={`w-2 h-2 rounded-full ${color}`}
        title={errorMessage || undefined}
      ></div>
    </div>
  );
}
