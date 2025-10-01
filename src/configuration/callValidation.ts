import { Linking, PermissionsAndroid } from 'react-native';
import RNCallKeep from 'react-native-callkeep';
import { navigate } from '../helper/navigationRef';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Simple in-memory storage to correlate incoming calls with payload
const callUuidToPayload = new Map<string, any>();
let onAnswerCallback:
    | ((args: { callUUID: string; payload?: any }) => void)
    | null = null;
let onEndCallback:
    | ((args: { callUUID: string }) => void)
    | null = null;

export const setOnAnswerListener = (
    cb: (args: { callUUID: string; payload?: any }) => void,
) => {
    onAnswerCallback = cb;
};

export const setOnEndListener = (
    cb: (args: { callUUID: string }) => void,
) => {
    onEndCallback = cb;
};

const options = {
    ios: {
        appName: 'PujaGuru',
    },
    android: {
        alertTitle: 'Permissions required',
        alertDescription:
            'PujaGuru needs permission to manage calls and use microphone',
        cancelButton: 'Cancel',
        okButton: 'OK',
        imageName: 'ic_launcher',
        additionalPermissions: [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO],
        foregroundService: {
            channelId: 'com.panditjiapp.pujaguru',
            channelName: 'PujaGuru Calls',
            notificationTitle: 'In-call service is running',
            notificationIcon: 'ic_launcher',
        },
    },
};

let setupDone = false;

export async function initCallKeep(): Promise<void> {
    if (setupDone) return;
    try {
        await RNCallKeep.setup(options as any);
        try {
            (RNCallKeep as any).setAvailable?.(true);
        } catch (_e) { }

        // Answer
        RNCallKeep.addEventListener('answerCall', async ({ callUUID }) => {
            let payload = callUuidToPayload.get(callUUID);
            console.log('payload', payload);
            if (!payload) {
                // Retrieve from AsyncStorage if not in memory (kill mode)
                const storedPayload = await AsyncStorage.getItem(`callPayload_${callUUID}`);
                if (storedPayload) {
                    payload = JSON.parse(storedPayload);
                }
            }
            if (onAnswerCallback) {
                onAnswerCallback({ callUUID, payload });
            }
            if (payload?.meeting_url) {
                navigate('Main', {
                    screen: 'AppBottomTabNavigator',
                    params: {
                        screen: 'HomeNavigator',
                        params: {
                            screen: 'ChatScreen',
                            params: {
                                incomingMeetingUrl: payload?.meeting_url,
                                currentCallUUID: callUUID,
                                booking_id: payload?.booking_id,
                                user_id: payload?.sender_id,
                                other_user_name: payload?.callerName || 'Call',
                                videocall: true,
                            },
                        },
                    },
                });
            }
        });

        // End
        RNCallKeep.addEventListener('endCall', ({ callUUID }) => {
            console.log('triger endcall =================+>');
            const deleted = callUuidToPayload.delete(callUUID);
            if (deleted) {
                RNCallKeep.endCall(callUUID);
                if (onEndCallback) {
                    onEndCallback({ callUUID });
                }
                AsyncStorage.removeItem(`callPayload_${callUUID}`); // Clean up
            }
        });

        // Did Display Incoming Call (Android)
        RNCallKeep.addEventListener('didDisplayIncomingCall', () => {
            // Keep mapping until answered/ended
        });

        setupDone = true;
    } catch (_e) {
        // setup may throw if permissions missing or module not ready
    }
}

export function displayIncomingCall(args: {
    callUUID: string;
    handle?: string;
    localizedCallerName?: string;
    hasVideo?: boolean;
    payload?: any;
}) {
    const {
        callUUID,
        handle = 'PujaGuru',
        localizedCallerName = 'Incoming call',
        hasVideo = true,
        payload,
    } = args;
    if (payload) {
        callUuidToPayload.set(callUUID, payload);
        // Persist payload in AsyncStorage for kill mode
        AsyncStorage.setItem(`callPayload_${callUUID}`, JSON.stringify(payload));
        // Auto-end call after 30 seconds if unanswered
        setTimeout(() => {
            if (callUuidToPayload.has(callUUID)) {
                endIncomingCall(callUUID);
            }
        }, 30000);
    }
    try {
        (RNCallKeep as any).displayIncomingCall(
            callUUID,
            handle,
            localizedCallerName,
            'generic',
            hasVideo,
        );
    } catch (_e) {
        // Fallback to older signature
        (RNCallKeep as any).displayIncomingCall(
            callUUID,
            handle,
            localizedCallerName,
            hasVideo,
            'generic',
        );
    }
}

export function endIncomingCall(callUUID: string) {
    RNCallKeep.endCall(callUUID);
    callUuidToPayload.delete(callUUID);
    AsyncStorage.removeItem(`callPayload_${callUUID}`); // Clean up
}