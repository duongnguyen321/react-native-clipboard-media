require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-media-clipboard"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  react-native-media-clipboard - A React Native library for copying various media types to clipboard
                   DESC
  s.homepage     = "https://github.com/duonguyen321/react-native-media-clipboard"
  s.license      = "MIT"
  s.authors      = { "duonguyen321" => "duongcoilc2004@gmail.com" }
  s.platforms    = { :ios => "11.0" }
  s.source       = { :git => "https://github.com/duonguyen321/react-native-media-clipboard.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,c,cc,cpp,m,mm,swift}"
  s.requires_arc = true

  s.dependency "React-Core"
  
  # Enable module maps for better Swift integration
  s.module_map = 'ios/MediaClipboard.modulemap'
  
  # Define the Swift version
  s.swift_version = "5.0"
end 