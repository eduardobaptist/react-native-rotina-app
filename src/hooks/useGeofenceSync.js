import { useEffect } from 'react';
import { ensureProximityPermissions } from '../services/permissions';
import { refreshGeofences } from '../services/geofencing';

export function useGeofenceSync(userId) {
  useEffect(() => {
    if (!userId) return;

    (async () => {
      await ensureProximityPermissions();
      await refreshGeofences(userId);
    })();
  }, [userId]);
}
