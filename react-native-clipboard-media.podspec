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

  s.source_files = "ios/**/*.{h,c,cc,cpp,m,mm}"
  s.requires_arc = true

  s.dependency "React-Core"
end 