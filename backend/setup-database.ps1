# Script PowerShell per Setup Database Microsoft Fabric
# Esegue lo script SQL con autenticazione Azure AD

$ServerName = "jxbqdy74rvpujmzpttqqewlehe-xs5s6bwrjy7eloim5vh5x46hf4.database.fabric.microsoft.com,1433"
$DatabaseName = "UserInputDatabase-df5017e9-bab5-4c85-9253-d478ef679db4"
$SqlScriptPath = ".\setup-database.sql"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Setup Database Ticketing System" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Server: $ServerName" -ForegroundColor Yellow
Write-Host "Database: $DatabaseName" -ForegroundColor Yellow
Write-Host ""
Write-Host "Si aprirà una finestra per l'autenticazione Azure AD..." -ForegroundColor Green
Write-Host ""

# Esegui lo script SQL
sqlcmd -S $ServerName `
       -d $DatabaseName `
       --authentication-method ActiveDirectoryInteractive `
       -i $SqlScriptPath

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Database creato e popolato con successo!" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Errore durante l'esecuzione dello script SQL" -ForegroundColor Red
    Write-Host "Codice errore: $LASTEXITCODE" -ForegroundColor Red
    Write-Host ""
}

# Verifica tabelle create
Write-Host "Verifica tabelle create:" -ForegroundColor Cyan
sqlcmd -S $ServerName `
       -d $DatabaseName `
       --authentication-method ActiveDirectoryInteractive `
       -Q "SELECT 'COMPETENZE' AS Tabella, COUNT(*) AS Righe FROM competenza UNION ALL SELECT 'MACRO_CAUSE', COUNT(*) FROM macro_causa UNION ALL SELECT 'CAUSE', COUNT(*) FROM causa UNION ALL SELECT 'TICKET_APERTI', COUNT(*) FROM ticket_aperti UNION ALL SELECT 'COMMENTI', COUNT(*) FROM commenti;"
