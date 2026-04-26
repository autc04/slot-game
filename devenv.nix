{ pkgs, ... }:

{
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_25;
    npm = {
      enable = true;
      install.enable = true;
    };
  };

  processes.dev-server = {
    exec = "npm run serve";
    ready.exec = ''
      node -e "fetch('http://[::1]:4200/').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"
    '';
  };

  env = {
    npm_config_fund = "false";
  };

  scripts = {
    install.exec = "npm install";
    dev.exec = "npm run serve";
    start.exec = "npm run start";
    build.exec = "npm run build";
  };

  enterShell = ''
    echo "slot-game development environment loaded"
    echo "Node: $(node --version)"
    echo "npm: $(npm --version)"
    echo "Dependencies install automatically when entering the shell"
    echo "Run 'devenv up' or 'dev' to start webpack-dev-server on http://localhost:4200"
  '';
}