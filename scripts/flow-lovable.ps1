# Encoding UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FLOW LOVABLE - Synchronisation Git" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Detection automatique des remotes
Write-Host "[INFO] Detection automatique de la configuration Git..." -ForegroundColor Cyan
$remotes = git remote -v | Out-String

# Lovable remote (my-med-plus)
if ($remotes -match "lovable\s+https://github.com/techno2main/my-med-plus") {
    $LOVABLE_REMOTE = "lovable"
} elseif ($remotes -match "my-med-plus\s+https://github.com/techno2main/my-med-plus") {
    $LOVABLE_REMOTE = "my-med-plus"
} else {
    Write-Host "[ERREUR] Remote Lovable (my-med-plus) non trouve!" -ForegroundColor Red
    Write-Host "Remotes disponibles:" -ForegroundColor Yellow
    git remote -v
    exit 1
}

# GitHub remote (my-health-plus)
if ($remotes -match "origin\s+https://github.com/techno2main/my-health-plus") {
    $GITHUB_REMOTE = "origin"
} elseif ($remotes -match "github\s+https://github.com/techno2main/my-health-plus") {
    $GITHUB_REMOTE = "github"
} else {
    Write-Host "[ERREUR] Remote GitHub (my-health-plus) non trouve!" -ForegroundColor Red
    Write-Host "Remotes disponibles:" -ForegroundColor Yellow
    git remote -v
    exit 1
}

Write-Host "[OK] Configuration detectee:" -ForegroundColor Green
Write-Host "  - Lovable (my-med-plus): $LOVABLE_REMOTE" -ForegroundColor White
Write-Host "  - GitHub (my-health-plus): $GITHUB_REMOTE" -ForegroundColor White
Write-Host ""

# Fonction pour afficher les erreurs et arreter
function Stop-OnError {
    param($Message)
    Write-Host "[ERREUR] $Message" -ForegroundColor Red
    exit 1
}

# Fonction pour executer une commande git avec gestion d'erreur
function Invoke-GitCommand {
    param(
        [string]$Command,
        [string]$Description
    )
    Write-Host "[>] $Description..." -ForegroundColor Yellow
    
    # Executer la commande et capturer la sortie et les erreurs
    $output = git $Command.Split(' ') 2>&1
    $exitCode = $LASTEXITCODE
    
    # Messages Git qui ne sont pas des erreurs reelles
    $infoMessages = @(
        "Already on",
        "Everything up-to-date",
        "Switched to branch",
        "Your branch is up to date",
        "nothing to commit"
    )
    
    # Verifier si c'est une vraie erreur ou juste un message d'info
    $isRealError = $exitCode -ne 0
    if ($output) {
        $outputStr = $output | Out-String
        foreach ($msg in $infoMessages) {
            if ($outputStr -match $msg) {
                $isRealError = $false
                break
            }
        }
    }
    
    if ($isRealError) {
        Write-Host "Sortie: $output" -ForegroundColor Gray
        Stop-OnError "$Description a echoue"
    }
    
    Write-Host "[OK] $Description termine" -ForegroundColor Green
    return $output
}

# Sauvegarder les changements locaux si necessaire
Write-Host "[INFO] Verification des changements locaux..." -ForegroundColor Cyan
$status = git status --porcelain
if ($status) {
    Write-Host "[WARN] Changements locaux detectes. Creation d'un stash..." -ForegroundColor Yellow
    $timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
    git stash push -m "flow-lovable-auto-stash-$timestamp"
    if ($LASTEXITCODE -ne 0) {
        Stop-OnError "Impossible de sauvegarder les changements locaux"
    }
    Write-Host "[OK] Changements locaux sauvegardes" -ForegroundColor Green
    $hasStash = $true
} else {
    Write-Host "[OK] Aucun changement local a sauvegarder" -ForegroundColor Green
    $hasStash = $false
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ETAPE 1: Recuperation de Lovable" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Fetch depuis Lovable
Invoke-GitCommand "fetch $LOVABLE_REMOTE" "Recuperation des dernieres modifications de Lovable"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ETAPE 2: Merge dans dev" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Basculer sur dev
Invoke-GitCommand "checkout dev" "Basculement sur la branche dev"

# Merger la branche main de Lovable dans dev
Write-Host "[>] Merge de $LOVABLE_REMOTE/main dans dev..." -ForegroundColor Yellow
$mergeOutput = git merge "$LOVABLE_REMOTE/main" --no-edit 2>&1 | Out-String
$mergeExitCode = $LASTEXITCODE

# Verifier si "Already up to date" ou similaire
if ($mergeOutput -match "Already up.to.date|Already up-to-date") {
    Write-Host "[OK] dev deja a jour avec $LOVABLE_REMOTE/main" -ForegroundColor Green
} elseif ($mergeExitCode -ne 0) {
    if ($mergeOutput -match "conflict") {
        Write-Host "[ERREUR] CONFLITS DETECTES!" -ForegroundColor Red
        Write-Host "Veuillez resoudre les conflits manuellement, puis:" -ForegroundColor Yellow
        Write-Host "1. git add ." -ForegroundColor Cyan
        Write-Host "2. git commit" -ForegroundColor Cyan
        Write-Host "3. Relancez le script" -ForegroundColor Cyan
        exit 1
    } else {
        Write-Host "Sortie: $mergeOutput" -ForegroundColor Gray
        Stop-OnError "Merge dans dev a echoue"
    }
} else {
    Write-Host "[OK] Merge dans dev termine" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ETAPE 3: Push dev vers GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Push dev vers GitHub
Invoke-GitCommand "push $GITHUB_REMOTE dev" "Push de dev vers GitHub (my-health-plus)"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ETAPE 4: Merge dev dans main" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Basculer sur main
Invoke-GitCommand "checkout main" "Basculement sur la branche main"

# Merger dev dans main
Write-Host "[>] Merge de dev dans main..." -ForegroundColor Yellow
$mergeOutput = git merge dev --no-edit 2>&1 | Out-String
$mergeExitCode = $LASTEXITCODE

# Verifier si "Already up to date" ou similaire
if ($mergeOutput -match "Already up.to.date|Already up-to-date") {
    Write-Host "[OK] main deja a jour avec dev" -ForegroundColor Green
} elseif ($mergeExitCode -ne 0) {
    if ($mergeOutput -match "conflict") {
        Write-Host "[ERREUR] CONFLITS DETECTES!" -ForegroundColor Red
        Write-Host "Veuillez resoudre les conflits manuellement, puis:" -ForegroundColor Yellow
        Write-Host "1. git add ." -ForegroundColor Cyan
        Write-Host "2. git commit" -ForegroundColor Cyan
        Write-Host "3. Relancez le script" -ForegroundColor Cyan
        exit 1
    } else {
        Write-Host "Sortie: $mergeOutput" -ForegroundColor Gray
        Stop-OnError "Merge de dev dans main a echoue"
    }
} else {
    Write-Host "[OK] Merge dans main termine" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ETAPE 5: Push main vers GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Push main vers GitHub
Invoke-GitCommand "push $GITHUB_REMOTE main" "Push de main vers GitHub (my-health-plus)"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ETAPE 6: Alignement des branches" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# S'assurer que dev est aligne avec main
Invoke-GitCommand "checkout dev" "Retour sur la branche dev"
Write-Host "[>] Alignement de dev avec main..." -ForegroundColor Yellow
$mergeOutput = git merge main --no-edit 2>&1 | Out-String
$mergeExitCode = $LASTEXITCODE

if ($mergeOutput -match "Already up.to.date|Already up-to-date") {
    Write-Host "[OK] dev deja aligne avec main" -ForegroundColor Green
} elseif ($mergeExitCode -eq 0) {
    Write-Host "[OK] dev aligne avec main" -ForegroundColor Green
    # Push pour s'assurer que dev sur GitHub est aussi aligne
    Invoke-GitCommand "push $GITHUB_REMOTE dev" "Push de dev aligne vers GitHub (my-health-plus)"
} else {
    Write-Host "[WARN] Probleme lors de l'alignement, mais on continue..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ETAPE 7: Build Android" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Restaurer le stash si necessaire
if ($hasStash) {
    Write-Host "[>] Restauration des changements locaux..." -ForegroundColor Yellow
    git stash pop
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[WARN] Impossible de restaurer automatiquement le stash" -ForegroundColor Yellow
        Write-Host "Utilisez 'git stash list' et 'git stash pop' manuellement" -ForegroundColor Yellow
    } else {
        Write-Host "[OK] Changements locaux restaures" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "[>] Lancement du build Android..." -ForegroundColor Yellow
Write-Host ""

# Lancer flow:build
npm run flow:build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  [OK] FLOW LOVABLE TERMINE AVEC SUCCES!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Resume:" -ForegroundColor Cyan
    Write-Host "  - Lovable main -> dev locale [OK]" -ForegroundColor Green
    Write-Host "  - dev -> GitHub dev [OK]" -ForegroundColor Green
    Write-Host "  - dev -> main locale [OK]" -ForegroundColor Green
    Write-Host "  - main -> GitHub main [OK]" -ForegroundColor Green
    Write-Host "  - Branches alignees [OK]" -ForegroundColor Green
    Write-Host "  - Build Android [OK]" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[ERREUR] Le build Android a echoue" -ForegroundColor Red
    exit 1
}
