#import "AppDelegate.h"
#import "RNSplashScreen.h" // Import RNSplashScreen

#import <React/RCTBundleURLProvider.h>
#import <Firebase.h>
@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  
  self.moduleName = @"PanditApp";
  
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  BOOL didFinishLaunching = [super application:application didFinishLaunchingWithOptions:launchOptions];
  [RNSplashScreen show]; // Show splash screen
  return didFinishLaunching;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
