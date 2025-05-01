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
      in with pkgs; with pkgs.lib; let
        # Common development packages for all shells
        commonDevPackages = [
          fd
          file
          jq
          just
          pnpm_10
          nodejs_22
          postgresql
          libuuid
          wasm-pack

          # for deployment/ci
          doctl
          kubectl
        ];
        # Common shell hook content
        commonShellHook = ''
          export RUST_LOG="penumbra=debug"
          export RUST_SRC_PATH=${pkgs.rustPlatform.rustLibSrc} # Required for rust-analyzer
          export NEXT_TELEMETRY_DISABLED=1
          export TURBO_TELEMETRY_DISABLED=1
          export LD_LIBRARY_PATH="${pkgs.lib.makeLibraryPath [pkgs.libuuid]}:$LD_LIBRARY_PATH"
        '';
      in
      {
        devShells = {
          default = craneLib.devShell {
            name = "penumbra-web devShell";
            packages = commonDevPackages;
            shellHook = ''
              ${commonShellHook}
            '';
          };

          # Separate opt-in devshell that excludes rust tooling.
          minimal = pkgs.mkShell {
            name = "minimal penumbra-web devShell";
            packages = commonDevPackages;
            shellHook = ''
              ${commonShellHook}
            '';
          };
        };
      }
    );
}
