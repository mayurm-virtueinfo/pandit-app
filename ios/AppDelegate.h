//
//  AppDelegate.h
//  PanditApp
//
//  Created by tarang on 26/08/25.
//


#import <RCTAppDelegate.h>
#import <UIKit/UIKit.h>
#import <UserNotifications/UserNotifications.h>
#import <FirebaseMessaging/FirebaseMessaging.h>  // ✅ Needed for FCM
 
@interface AppDelegate : RCTAppDelegate <UNUserNotificationCenterDelegate, FIRMessagingDelegate> // ✅ Add delegates
 
@end
