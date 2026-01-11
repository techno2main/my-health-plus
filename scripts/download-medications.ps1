# Script de téléchargement des fichiers de médicaments officiels
# Source : Base de Données Publique des Médicaments (ANSM)
# https://base-donnees-publique.medicaments.gouv.fr/

Write-Host "🚀 Téléchargement des données médicaments officielles" -ForegroundColor Cyan
Write-Host "═" * 60 -ForegroundColor Gray

# Créer le dossier datas
if (-not (Test-Path "datas")) {
    New-Item -ItemType Directory -Force -Path "datas" | Out-Null
    Write-Host "✅ Dossier 'datas' créé" -ForegroundColor Green
}

# URLs des fichiers
$files = @(
    @{
        Name = "CIS_bdpm.txt"
        Url = "https://base-donnees-publique.medicaments.gouv.fr/download/file/CIS_bdpm.txt"
        Description = "Liste complète des médicaments"
    },
    @{
        Name = "CIS_COMPO_bdpm.txt"
        Url = "https://base-donnees-publique.medicaments.gouv.fr/download/file/CIS_COMPO_bdpm.txt"
        Description = "Composition (substances actives)"
    }
)

# Télécharger les fichiers
foreach ($file in $files) {
    Write-Host "`n📥 Téléchargement : $($file.Description)" -ForegroundColor Yellow
    Write-Host "   Source : $($file.Name)" -ForegroundColor Gray
    
    try {
        Invoke-WebRequest -Uri $file.Url -OutFile "datas/$($file.Name)" -ErrorAction Stop
        
        $fileInfo = Get-Item "datas/$($file.Name)"
        $sizeMB = [math]::Round($fileInfo.Length / 1MB, 2)
        
        Write-Host "   ✅ Téléchargé : $sizeMB MB" -ForegroundColor Green
        
        # Conversion en UTF-8
        Write-Host "   🔄 Conversion en UTF-8..." -ForegroundColor Yellow
        $content = Get-Content "datas/$($file.Name)" -Encoding Default
        $content | Out-File "datas/$($file.Name -replace '\.txt$', '_utf8.txt')" -Encoding UTF8
        
        $utf8FileInfo = Get-Item "datas/$($file.Name -replace '\.txt$', '_utf8.txt')"
        $utf8SizeMB = [math]::Round($utf8FileInfo.Length / 1MB, 2)
        
        Write-Host "   ✅ Converti : $utf8SizeMB MB" -ForegroundColor Green
        
    } catch {
        Write-Host "   ❌ Erreur : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Statistiques
Write-Host "`n" + ("═" * 60) -ForegroundColor Gray
Write-Host "📊 Fichiers téléchargés :" -ForegroundColor Cyan

Get-ChildItem datas/ -Filter "*.txt" | ForEach-Object {
    $sizeMB = [math]::Round($_.Length / 1MB, 2)
    Write-Host "   • $($_.Name) : $sizeMB MB" -ForegroundColor White
}

Write-Host "`n✅ Téléchargement terminé !" -ForegroundColor Green
Write-Host "   Prochaine étape : npx tsx scripts/import-medications.ts" -ForegroundColor Yellow
