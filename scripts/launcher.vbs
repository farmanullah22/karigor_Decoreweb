Set WshShell = CreateObject("WScript.Shell")
strCmd = "cmd /c ""C:\coding\learning\projects\karigor_Decoreweb\scripts\start-dev.cmd"" > ""C:\coding\learning\projects\karigor_Decoreweb\.logs\launcher.log"" 2>&1"
WshShell.Run strCmd, 0, False
Set WshShell = Nothing