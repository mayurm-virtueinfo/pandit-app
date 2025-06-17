#import <RCTAppDelegate.h>
#import <UIKit/UIKit.h>
#import <UserNotifications/UserNotifications.h> // ✅ Required for push notification handling

@interface AppDelegate : RCTAppDelegate <UNUserNotificationCenterDelegate> // ✅ Add delegate

@end
