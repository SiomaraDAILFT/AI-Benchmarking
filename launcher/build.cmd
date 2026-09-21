@echo off
rem Builds the two top-level launchers from launcher.cs with the C# compiler that ships
rem with Windows (.NET Framework 4, present on every Windows 10/11 machine). Run from
rem anywhere; output lands in the repository's top folder.
set CSC=%WINDIR%\Microsoft.NET\Framework64\v4.0.30319\csc.exe
if not exist "%CSC%" set CSC=%WINDIR%\Microsoft.NET\Framework\v4.0.30319\csc.exe
cd /d "%~dp0.."
"%CSC%" /nologo /target:winexe /optimize /out:"Run the full DRACO test.exe" launcher\launcher.cs
"%CSC%" /nologo /target:winexe /optimize /out:"Run the efficient DRACO test.exe" launcher\launcher.cs
dir /b *.exe
