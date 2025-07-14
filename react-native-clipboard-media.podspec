require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-clipboard-media"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  react-native-clipboard-media - A React Native library for copying various media types to clipboard
                   DESC
  s.homepage     = "https://github.com/duonguyen321/react-native-clipboard-media"
  s.license      = "MIT"
  s.authors      = { "duonguyen321" => "duongcoilc2004@gmail.com" }
  s.platforms    = { :ios => "11.0" }
  s.source       = { :git => "https://github.com/duonguyen321/react-native-clipboard-media.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,c,cc,cpp,m,mm,swift}"
  s.requires_arc = true

  s.dependency "React-Core"
  
  # Configure as static framework to support Swift with module maps
  s.static_framework = true
  
  # Enable module maps for better Swift integration
  s.module_map = 'ios/MediaClipboard.modulemap'
  
  # Define the Swift version
  s.swift_version = "5.0"
end 