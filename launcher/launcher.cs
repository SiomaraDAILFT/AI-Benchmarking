// Tiny Windows launcher for the DRACO testing app. Compiled twice, into
// "Run the full DRACO test.exe" and "Run the efficient DRACO test.exe"; the file
// name decides which protocol preset the page opens with. Needs Node.js 20 or
// newer on the machine (https://nodejs.org); if it is missing, a message says so.
// Build: see launcher\build.cmd. Source kept next to the executables.
using System;
using System.Diagnostics;
using System.IO;
using System.Net.Sockets;
using System.Threading;
using System.Windows.Forms;

static class Launcher
{
    const int Port = 4173;

    static bool Listening()
    {
        try { using (var c = new TcpClient()) { c.Connect("127.0.0.1", Port); return true; } }
        catch { return false; }
    }

    static bool NodeAvailable()
    {
        try
        {
            var psi = new ProcessStartInfo("node", "--version") { UseShellExecute = false, RedirectStandardOutput = true, CreateNoWindow = true };
            using (var p = Process.Start(psi)) { p.WaitForExit(8000); return p.HasExited && p.ExitCode == 0; }
        }
        catch { return false; }
    }

    [STAThread]
    static int Main()
    {
        string here = AppDomain.CurrentDomain.BaseDirectory;
        string exe = Path.GetFileNameWithoutExtension(Application.ExecutablePath).ToLowerInvariant();
        string preset = exe.Contains("efficient") ? "reduced" : "draco";
        string server = Path.Combine(here, "app", "server.mjs");

        if (!File.Exists(server))
        {
            MessageBox.Show("The app folder is missing next to this file (expected app\\server.mjs). Keep this executable in the top folder of the repository.", "DRACO testing app", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return 1;
        }
        if (!Listening())
        {
            if (!NodeAvailable())
            {
                MessageBox.Show("This app runs on Node.js, which was not found on this computer.\n\nInstall the current version from https://nodejs.org (one click, default options), then double-click this file again.", "DRACO testing app", MessageBoxButtons.OK, MessageBoxIcon.Information);
                Process.Start(new ProcessStartInfo("https://nodejs.org") { UseShellExecute = true });
                return 1;
            }
            var psi = new ProcessStartInfo("node", "\"" + server + "\"") { WorkingDirectory = here, UseShellExecute = true, WindowStyle = ProcessWindowStyle.Minimized };
            Process.Start(psi);
            for (int i = 0; i < 40 && !Listening(); i++) Thread.Sleep(250);
        }
        Process.Start(new ProcessStartInfo("http://localhost:" + Port + "/?protocol=" + preset) { UseShellExecute = true });
        return 0;
    }
}
