import ExpoModulesCore
import UIKit

// covers the window with a picture of the old theme and fades it out once the new theme has drawn
public class ThemeFadeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ThemeFade")

    AsyncFunction("cover") { (duration: Double, delay: Double) in
      guard
        let window = UIApplication.shared.connectedScenes
          .compactMap({ ($0 as? UIWindowScene)?.keyWindow })
          .first,
        let snapshot = window.snapshotView(afterScreenUpdates: false)
      else { return }

      snapshot.frame = window.bounds
      snapshot.isUserInteractionEnabled = false
      window.addSubview(snapshot)
      UIView.animate(
        withDuration: duration,
        delay: delay,
        options: [.curveEaseInOut],
        animations: { snapshot.alpha = 0 },
        completion: { _ in snapshot.removeFromSuperview() }
      )
    }.runOnQueue(.main)
  }
}
