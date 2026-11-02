import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import RNBootSplash // ⬅️ add this import
import HotUpdater
import FirebaseCore
// NitroFetch: jangan `import NitroFetch` di Swift — Clang module-nya expose .hpp
// dan bakal kena dependency-scanner failure. NitroAutoPrefetcher Obj-C class
// otomatis available di Swift lewat Wuzz-Bridging-Header.h

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    configureFirebase()
    NitroAutoPrefetcher.prefetchOnStart()

    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "Wuzz",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }

  // A link of the app's own scheme (wuzz:// or wuzz-stg://): without this the OS opens the app but React Native never hears of the URL,
  // so Linking, and the deeplinks built on it, do nothing on iOS.
  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey: Any] = [:]
  ) -> Bool {
    return RCTLinkingManager.application(app, open: url, options: options)
  }
}

/// One Firebase app per bundle id (.dev, .staging, production), each with its own
/// plist in the app bundle. Picks the plist whose BUNDLE_ID matches this build, so a
/// build without a matching file simply runs without Firebase instead of crashing.
private func configureFirebase() {
  let bundleId = Bundle.main.bundleIdentifier ?? ""
  let names = [
    "GoogleService-Info", "GoogleService-Info.Staging", "GoogleService-Info.Production",
  ]
  for name in names {
    guard let path = Bundle.main.path(forResource: name, ofType: "plist"),
      let options = FirebaseOptions(contentsOfFile: path),
      options.bundleID == bundleId
    else { continue }
    FirebaseApp.configure(options: options)
    return
  }
  NSLog("Firebase not configured: no GoogleService-Info plist matches \(bundleId)")
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    HotUpdater.bundleURL() 
#endif
  }

   // ⬇️ override this method
  override func customize(_ rootView: RCTRootView) {
    super.customize(rootView)
    RNBootSplash.initWithStoryboard("BootSplash", rootView: rootView) // ⬅️ initialize the splash screen
  }
}
