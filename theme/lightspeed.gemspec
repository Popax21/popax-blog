Gem::Specification.new do |spec|
  spec.name                    = "lightspeed"
  spec.version                 = "1.0.0"
  spec.authors                 = ["tajacks", "Popax21"]
  spec.summary                 = %q{A modified version of the LightSpeed Jekyll theme by tajacks.}
  spec.homepage                = "https://github.com/tajacks/lightspeed"
  spec.license                 = "GPL-3.0-only"

  spec.metadata["plugin_type"] = "theme"

  spec.files                   = Dir['**/*'].keep_if { |file| File.file?(file) }

  spec.add_runtime_dependency "jekyll"
  spec.add_runtime_dependency "jekyll-feed"
  spec.add_runtime_dependency "jekyll-paginate-v2"
end