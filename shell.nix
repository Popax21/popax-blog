let
  pkgs = import <nixpkgs> {};
in
  pkgs.mkShellNoCC {
    packages = [
      (pkgs.bundlerEnv {
        name = "popax-blog-jekyll";
        gemdir = ./.;
        extraConfigPaths = ["${pkgs.runCommandNoCCLocal "theme-symlink" {} "mkdir -p $out && ln -s ${toString ./theme} $out/theme"}/theme"];
      })
      (pkgs.writeShellApplication {
        name = "update-gems";
        text = ''
          pushd ${toString ./.}
          rm -f Gemfile.lock gemset.nix

          export BUNDLE_PATH=vendor
          export BUNDLE_FORCE_RUBY_PLATFORM=true

          bundler lock
          bundler cache --no-install
          bundix

          rm -rf vendor .bundle
          popd
        '';
        runtimeInputs = [pkgs.bundler pkgs.bundix];
      })
    ];
  }