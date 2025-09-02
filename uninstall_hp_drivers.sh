#!/bin/bash

# HP Drivers Uninstaller para macOS Sonoma
# Script que remove drivers HP e restaura backups

# Detectar o diretório onde o script está localizado
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Desinstalador de Drivers HP ==="
echo "Versão: 3.4.0"
echo "Diretório do script: $SCRIPT_DIR"
echo ""

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    echo "ERRO: Este script precisa ser executado como administrador"
    echo "Execute: sudo ./uninstall_hp_drivers.sh"
    exit 1
fi

echo "Iniciando desinstalação dos drivers HP..."
echo ""

# Função para desinstalar com confirmação
uninstall_with_confirm() {
    local path="$1"
    local description="$2"
    
    if [ -e "$path" ]; then
        echo "Removendo: $description"
        echo "Caminho: $path"
        read -p "Confirmar remoção? (s/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Ss]$ ]]; then
            rm -rf "$path"
            echo "✓ Removido: $description"
        else
            echo "⚠ Mantido: $description"
        fi
    else
        echo "⚠ Não encontrado: $description"
    fi
}

# Função para restaurar backup
restore_backup() {
    local path="$1"
    local description="$2"
    
    # Procurar por backups
    for backup in "${path}".backup.*; do
        if [ -e "$backup" ]; then
            echo "Backup encontrado: $backup"
            read -p "Restaurar backup de $description? (s/N): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Ss]$ ]]; then
                rm -rf "$path" 2>/dev/null
                mv "$backup" "$path"
                echo "✓ Backup restaurado: $description"
            else
                echo "⚠ Backup mantido: $backup"
            fi
            return
        fi
    done
    echo "⚠ Nenhum backup encontrado para: $description"
}

# 1. Descarregar kernel extension
echo "1. Descarregando kernel extension..."
if kextstat | grep -q "hp_io_enabler_compound"; then
    echo "Descarregando kext..."
    kextunload "/Library/Extensions/hp_io_enabler_compound.kext" 2>/dev/null
    echo "✓ Kernel extension descarregado"
else
    echo "⚠ Kernel extension não estava carregado"
fi

# 2. Remover kernel extension
echo ""
echo "2. Removendo kernel extension..."
uninstall_with_confirm "/Library/Extensions/hp_io_enabler_compound.kext" "Kernel Extension HP"

# 3. Remover drivers de impressora
echo ""
echo "3. Removendo drivers de impressora..."
uninstall_with_confirm "/Library/Printers/hp" "Drivers de Impressora HP"

# 4. Remover aplicações Image Capture
echo ""
echo "4. Removendo aplicações Image Capture..."
uninstall_with_confirm "/Library/Image Capture/Devices" "Aplicações Image Capture HP"

# 5. Remover backends CUPS
echo ""
echo "5. Removendo backends CUPS..."
if [ -f "/usr/libexec/cups/backend/hpfax" ]; then
    echo "Removendo backend hpfax..."
    read -p "Confirmar remoção? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        rm -f "/usr/libexec/cups/backend/hpfax"
        echo "✓ Backend hpfax removido"
    else
        echo "⚠ Backend hpfax mantido"
    fi
fi

if [ -f "/usr/libexec/cups/backend/hpFaxbackend" ]; then
    echo "Removendo backend hpFaxbackend..."
    read -p "Confirmar remoção? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        rm -f "/usr/libexec/cups/backend/hpFaxbackend"
        echo "✓ Backend hpFaxbackend removido"
    else
        echo "⚠ Backend hpFaxbackend mantido"
    fi
fi

# 6. Restaurar backups (opcional)
echo ""
echo "6. Restaurando backups..."
echo "Deseja restaurar os backups dos arquivos originais?"
read -p "Restaurar backups? (s/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Ss]$ ]]; then
    restore_backup "/Library/Extensions/hp_io_enabler_compound.kext" "Kernel Extension HP"
    restore_backup "/Library/Printers/hp" "Drivers de Impressora HP"
    restore_backup "/Library/Image Capture/Devices" "Aplicações Image Capture HP"
fi

# 7. Reiniciar serviços CUPS
echo ""
echo "7. Reiniciando serviços de impressão..."
launchctl unload /System/Library/LaunchDaemons/org.cups.cupsd.plist 2>/dev/null
launchctl load /System/Library/LaunchDaemons/org.cups.cupsd.plist
echo "✓ Serviços de impressão reiniciados"

# 8. Limpar cache do sistema
echo ""
echo "8. Limpando cache do sistema..."
rm -rf /Library/Caches/com.apple.kext.caches 2>/dev/null
rm -rf /System/Library/Caches/com.apple.kext.caches 2>/dev/null
echo "✓ Cache limpo"

echo ""
echo "=== Desinstalação Concluída ==="
echo ""
echo "Os drivers HP foram removidos do sistema!"
echo ""
echo "Próximos passos:"
echo "1. Reinicie o sistema para garantir que todas as mudanças sejam aplicadas"
echo "2. Se restaurou backups, verifique se tudo está funcionando normalmente"
echo ""
echo "Se houver problemas:"
echo "- Verifique se não há arquivos HP restantes em /Library/Printers/"
echo "- Verifique se não há kexts HP restantes em /Library/Extensions/"
echo "- Se necessário, reinstale os drivers originais do macOS"
