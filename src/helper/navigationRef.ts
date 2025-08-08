// navigationRef.ts
import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

let pendingNavigation: { name: string; params?: any } | null = null;

export function navigate(name: string, params?: any) {
    if (navigationRef.isReady()) {
        navigationRef.navigate(name, params);
    } else {
        // Store for later if navigation is not ready yet
        pendingNavigation = { name, params };
    }
}

export function storePendingNavigation(nav: { name: string; params?: any }) {
    if (navigationRef.isReady()) {
        navigationRef.navigate(nav.name, nav.params);
    } else {
        pendingNavigation = nav;
    }
}

export function checkPendingNavigation() {
    if (pendingNavigation && navigationRef.isReady()) {
        navigationRef.navigate(pendingNavigation.name, pendingNavigation.params);
        pendingNavigation = null;
    }
}
