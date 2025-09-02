#!/bin/bash

# Script para criar um executável inteligente do instalador de drivers HP
# Este executável procura os drivers em múltiplos locais

echo "=== Criador de Executável Inteligente HP Drivers ==="
echo ""

# Detectar o diretório onde o script está localizado
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Nome do executável
EXECUTABLE_NAME="HP_Drivers_Installer_Smart"

echo "Criando executável inteligente: $EXECUTABLE_NAME"
echo "Diretório do script: $SCRIPT_DIR"
echo ""

# Criar o executável
cat > "$EXECUTABLE_NAME" << 'EOF'
#!/bin/bash

# HP Drivers Installer - Executável Inteligente
# Versão: 3.4.0
# Compatível com macOS Sonoma

# Detectar o diretório onde o executável está localizado
EXECUTABLE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== Instalador de Drivers HP ==="
echo "Versão: 3.4.0"
echo "Compatível com macOS Sonoma"
echo "Diretório do executável: $EXECUTABLE_DIR"
echo ""

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    echo "ERRO: Este executável precisa ser executado como administrador"
    echo "Execute: sudo ./$EXECUTABLE_NAME"
    exit 1
fi

# Função para encontrar os drivers
find_drivers() {
    local search_paths=(
        "$EXECUTABLE_DIR"
        "$HOME"
        "/Users/tahoelake/HP DRIVERS Bash instaladores - HewlettPackardPrinterDrivers Pasta"
        "/Users/tahoelake/Desktop"
        "/Users/tahoelake/Downloads"
        "/Applications"
    )
    
    for path in "${search_paths[@]}"; do
        if [ -d "$path/Library" ] && [ -d "$path/usr" ]; then
            echo "✓ Drivers encontrados em: $path"
            DRIVERS_DIR="$path"
            return 0
        fi
    done
    
    echo "ERRO: Arquivos dos drivers não encontrados"
    echo "Locais verificados:"
    for path in "${search_paths[@]}"; do
        echo "  - $path"
    done
    echo ""
    echo "Certifique-se de que os diretórios 'Library' e 'usr' estão em um dos locais acima"
    return 1
}

# Encontrar os drivers
if ! find_drivers; then
    exit 1
fi

echo "Iniciando instalação dos drivers HP..."
echo ""

# Função para copiar com backup
copy_with_backup() {
    local src="$1"
    local dest="$2"
    
    if [ -e "$dest" ]; then
        echo "Fazendo backup de: $dest"
        mv "$dest" "${dest}.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    echo "Copiando: $src -> $dest"
    cp -R "$src" "$dest"
    
    # Definir permissões corretas
    chown -R root:wheel "$dest"
    chmod -R 755 "$dest"
}

# 1. Instalar kernel extension
echo "1. Instalando kernel extension..."
if [ -d "$DRIVERS_DIR/Library/Extensions/hp_io_enabler_compound.kext" ]; then
    copy_with_backup "$DRIVERS_DIR/Library/Extensions/hp_io_enabler_compound.kext" "/Library/Extensions/"
    echo "✓ Kernel extension instalado"
else
    echo "⚠ Kernel extension não encontrado"
fi

# 2. Instalar drivers de impressora
echo ""
echo "2. Instalando drivers de impressora..."
if [ -d "$DRIVERS_DIR/Library/Printers/hp" ]; then
    copy_with_backup "$DRIVERS_DIR/Library/Printers/hp" "/Library/Printers/"
    echo "✓ Drivers de impressora instalados"
else
    echo "⚠ Drivers de impressora não encontrados"
fi

# 3. Instalar aplicações Image Capture
echo ""
echo "3. Instalando aplicações Image Capture..."
if [ -d "$DRIVERS_DIR/Library/Image Capture/Devices" ]; then
    copy_with_backup "$DRIVERS_DIR/Library/Image Capture/Devices" "/Library/Image Capture/"
    echo "✓ Aplicações Image Capture instaladas"
else
    echo "⚠ Aplicações Image Capture não encontradas"
fi

# 4. Instalar backends CUPS
echo ""
echo "4. Instalando backends CUPS..."
if [ -d "$DRIVERS_DIR/usr/libexec/cups/backend" ]; then
    for backend in "$DRIVERS_DIR/usr/libexec/cups/backend"/*; do
        if [ -f "$backend" ]; then
            echo "Copiando backend: $(basename "$backend")"
            cp "$backend" "/usr/libexec/cups/backend/"
            chmod 755 "/usr/libexec/cups/backend/$(basename "$backend")"
        fi
    done
    echo "✓ Backends CUPS instalados"
else
    echo "⚠ Backends CUPS não encontrados"
fi

# 5. Configurar permissões especiais para kext
echo ""
echo "5. Configurando permissões..."
if [ -d "/Library/Extensions/hp_io_enabler_compound.kext" ]; then
    chown -R root:wheel "/Library/Extensions/hp_io_enabler_compound.kext"
    chmod -R 755 "/Library/Extensions/hp_io_enabler_compound.kext"
    echo "✓ Permissões configuradas"
fi

# 6. Carregar kernel extension
echo ""
echo "6. Carregando kernel extension..."
if [ -d "/Library/Extensions/hp_io_enabler_compound.kext" ]; then
    echo "Tentando carregar kext..."
    kextload "/Library/Extensions/hp_io_enabler_compound.kext" 2>/dev/null
    if [ $? -eq 0 ]; then
        echo "✓ Kernel extension carregado com sucesso"
    else
        echo "⚠ Kernel extension não pôde ser carregado automaticamente"
        echo "   Pode ser necessário reiniciar o sistema"
    fi
fi

# 7. Reiniciar serviços CUPS
echo ""
echo "7. Reiniciando serviços de impressão..."
launchctl unload /System/Library/LaunchDaemons/org.cups.cupsd.plist 2>/dev/null
launchctl load /System/Library/LaunchDaemons/org.cups.cupsd.plist
echo "✓ Serviços de impressão reiniciados"

echo ""
echo "=== Instalação Concluída ==="
echo ""
echo "Os drivers HP foram instalados com sucesso!"
echo ""
echo "Próximos passos:"
echo "1. Reinicie o sistema para garantir que o kernel extension seja carregado"
echo "2. Conecte sua impressora HP"
echo "3. Adicione a impressora em Preferências do Sistema > Impressoras e Scanners"
echo ""
echo "Se houver problemas:"
echo "- Verifique se a impressora está conectada"
echo "- Tente reiniciar o sistema"
echo "- Verifique as permissões de segurança em Preferências do Sistema > Segurança e Privacidade"
echo ""
echo "Backups dos arquivos originais foram criados com timestamp"
echo "Para desinstalar, execute: sudo ./HP_Drivers_Uninstaller"
EOF

# Tornar o arquivo executável
chmod +x "$EXECUTABLE_NAME"

echo "✓ Executável inteligente criado com sucesso: $EXECUTABLE_NAME"
echo ""
echo "Como usar:"
echo "1. Mova o executável para onde quiser"
echo "2. Execute: sudo ./$EXECUTABLE_NAME"
echo ""
echo "Este executável inteligente irá:"
echo "- Procurar os drivers em múltiplos locais"
echo "- Funcionar independentemente de onde esteja"
echo "- Mostrar onde encontrou os drivers"
