const fs = require("fs");
const path = require("path");
const ws = require("windows-shortcuts");
const platform = require("rise-common-electron").platform;
const programsDirectory = platform.isWindows() ?
  path.join(process.env.APPDATA, "Microsoft", "Windows", "Start Menu", "Programs") :
  path.join(process.env.HOME, ".local", "share", "applications");
const autostartPath = platform.isWindows() ?
  path.join(programsDirectory, "Startup", "Rise Vision Player.lnk") :
  path.join(process.env.HOME, ".config", "autostart", "rvplayer");

function checkShortcut(shortcut) {
  if (platform.isWindows()) {
    return checkWindowsShortcut(shortcut.windows);
  } else {
    return checkLinuxShortcut(shortcut.linux)
  }
}

function escapeStringRegex(s) {
  return s.replace('.', '\\.');
}

function checkWindowsShortcut(shortcut) {
  return new Promise((res, rej) => {
    ws.query(shortcut.location, (err, result) => {
      if (
        !err &&
        shortcut.target === result.target &&
        // Don't check args if shortcut.args is undefined
        (!shortcut.args || shortcut.args === result.args)
      ) {
        res();
      } else {
        rej();
      }
    });
  });
}

function checkLinuxShortcut(shortcut) {
  let fileContents;
  const nameRegex = RegExp(`\\n\\s*Name=${escapeStringRegex(shortcut.name)}`);
  const targetRegex = RegExp(`\\n\\s*Exec=${escapeStringRegex(shortcut.target)}`);
  return new Promise((res, rej) => {
    try {
      fileContents = fs.readFileSync(shortcut.location, 'utf8');
      if (nameRegex.test(fileContents) && targetRegex.test(fileContents)) {
        res();
      } else {
        rej();
      }
    } catch (e) {
      rej();
    }
  });
}

function checkShortcutList(version) {
  const installDir = platform.isWindows() ?
    path.join(process.env["LOCALAPPDATA"], "rvplayer", version) :
    path.join(process.env["HOME"], "rvplayer", version);

  const shortcuts = [
    {
      linux: {
        location: path.join(programsDirectory, "rvplayer-restart.desktop"),
        name: "Restart Rise Vision Player",
        target: path.join(installDir, "Installer", "scripts", "start.sh")
      },
      windows: {
        location: path.join(programsDirectory, "Rise Vision", "Restart Rise Vision Player.lnk"),
        target: path.join(installDir, "Installer", "scripts", "background.jse"),
        args: "start.bat"
      }
    },
    {
      linux: {
        location: path.join(programsDirectory, "rvplayer-stop.desktop"),
        name: "Stop Rise Vision Player",
        target: path.join(installDir, "Installer", "scripts", "stop.sh")
      },
      windows: {
        location: path.join(programsDirectory, "Rise Vision", "Stop Rise Vision Player.lnk"),
        target: path.join(installDir, "Installer", "scripts", "background.jse"),
        args: "stop.bat"
      }
    },
    {
      linux: {
        location: path.join(programsDirectory, "rvplayer", "rvplayer-uninstall.desktop"),
        name: "Uninstall Rise Vision Player",
        target: path.join(installDir, "Installer", "scripts", "uninstall.sh")
      },
      windows: {
        location: path.join(programsDirectory, "Rise Vision", "Uninstall Rise Vision Player.lnk"),
        target: path.join(installDir, "Installer", "scripts", "uninstall.bat")
      }
    },
    {
      linux: {
        location: autostartPath,
        target: `bash -c '${path.join(installDir, "Installer", "scripts", "start.sh --unattended")}'`
      },
      windows: {
        location: autostartPath,
        target: path.join(installDir, "Installer", "scripts", "background.jse"),
        args: "start.bat --unattended"
      }
    }
  ];
  return Promise.all(shortcuts.map(checkShortcut));
}

module.exports = {
  getAutostartPath() {
    return autostartPath;
  },

  checkShortcutsNameAndTarget(ctx, version) {
    return new Promise((res) => {
      function curriedCheckShortcutsNameAndTarget() {
        log.debug("Checking shortcuts");
        checkShortcutList(version)
          .then(res)
          .catch(() => {
            log.debug("Shortcut check failed");
            ctx.timeouts.checkShortcutList = setTimeout(() => {
              curriedCheckShortcutsNameAndTarget()
            }, 4000)
          });
      }

      curriedCheckShortcutsNameAndTarget();
    });
  }
};
