Pod::Spec.new do |s|
  s.name           = 'ThemeFade'
  s.version        = '1.0.0'
  s.summary        = 'Crossfades an in app theme change'
  s.author         = 'Cajaun Campbell'
  s.homepage       = 'https://github.com/cajaun'
  s.license        = 'MIT'
  s.platforms      = { :ios => '16.4' }
  s.source         = { git: '' }
  s.static_framework = true
  s.dependency 'ExpoModulesCore'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES' }
  s.source_files = '**/*.swift'
end
