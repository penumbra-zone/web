{
  description = "Dev shell for Penumbra web development";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-24.11";
    # nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
    crane.url = "github:ipetkov/crane";
    rust-overlay = {
      url = "github:oxalica/rust-overlay";
      inputs = {
        nixpkgs.follows = "nixpkgs";
      };
    };
  };

  outputs = { self, nixpkgs, flake-utils, crane, rust-overlay }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        overlays = [ (import rust-overlay) ];
        pkgs = import nixpkgs { inherit system overlays; };
        rustToolchain = pkgs.rust-bin.fromRustupToolchainFile ./packages/wasm/crate/rust-toolchain.toml;
        craneLib = (crane.mkLib pkgs).overrideToolchain rustToolchain;
        
        # Define libraries specifically required by Playwright
        playwrightLibs = with pkgs; [
          # The exact libraries from the error message
          glib                  # libglib-2.0.so.0, libgio-2.0.so.0
          glib.out              # Additional search path
          gobject-introspection # libgobject-2.0.so.0
          nss                   # libnss3.so, libnssutil3.so
          nspr                  # libnspr4.so
          dbus                  # libdbus-1.so.3
          atk                   # libatk-1.0.so.0
          at-spi2-atk          # libatk-bridge-2.0.so.0
          at-spi2-core         # libatspi.so.0
          expat                 # libexpat.so.1
          xorg.libX11          # libX11.so.6
          xorg.libXcomposite   # libXcomposite.so.1
          xorg.libXdamage      # libXdamage.so.1
          xorg.libXext         # libXext.so.6
          xorg.libXfixes       # libXfixes.so.3
          xorg.libXrandr       # libXrandr.so.2
          mesa                  # libgbm.so.1
          xorg.libxcb          # libxcb.so.1
          libxkbcommon         # libxkbcommon.so.0
          udev                  # libudev.so.1
          alsa-lib             # libasound.so.2

          # Additional dependencies that might be needed
          cups
          gtk3
          pango
          cairo
          freetype
          fontconfig
          libdrm
          libva
          pipewire
        ];
        
        # Additional packages for the dev environment
        playwrightPackages = with pkgs; [
          playwright
          playwright-driver.browsers
          chromium
          xvfb-run
        ];
        
      in with pkgs; with pkgs.lib; let
        # Common development packages for all shells
        commonDevPackages = [
          fd
          file
          firefox
          jq
          just
          nodejs_22
          pnpm_10
          postgresql
          libuuid
          wasm-pack
        ] ++ playwrightPackages;
        
        # Create the complete library path
        playwrightLibPath = makeLibraryPath playwrightLibs;
        uuidLibPath = pkgs.lib.makeLibraryPath [pkgs.libuuid];
        
        # Common shell hook content
        commonShellHook = ''
          export RUST_LOG="penumbra=debug"
          export RUST_SRC_PATH=${pkgs.rustPlatform.rustLibSrc} # Required for rust-analyzer
          export NEXT_TELEMETRY_DISABLED=1
          export TURBO_TELEMETRY_DISABLED=1
          
          # Set up LD_LIBRARY_PATH with all the required libraries.
          # The uuid lib is required for social card support.
          export LD_LIBRARY_PATH="${uuidLibPath}:${playwrightLibPath}:$LD_LIBRARY_PATH"
          
          # Playwright configuration
          export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
          export PLAYWRIGHT_BROWSERS_PATH=${pkgs.playwright-driver.browsers}
          export PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=true
          
          # Display settings for headless testing
          export DISPLAY=:99
          
          # Set up XDG directories
          export XDG_RUNTIME_DIR="/tmp/runtime-dir-$$"
          mkdir -p $XDG_RUNTIME_DIR
          chmod 700 $XDG_RUNTIME_DIR
          
          # Font configuration
          export FONTCONFIG_PATH=${pkgs.fontconfig.out}/etc/fonts
        '';
      in
      {
        devShells = {
          default = craneLib.devShell {
            name = "penumbra-web devShell";
            packages = commonDevPackages ++ playwrightLibs;
            shellHook = ''
              ${commonShellHook}
            '';
          };

          # Separate opt-in devshell that excludes rust tooling.
          minimal = pkgs.mkShell {
            name = "minimal penumbra-web devShell";
            packages = commonDevPackages ++ playwrightLibs;
            shellHook = ''
              ${commonShellHook}
            '';
          };
        };
      }
    );
}
