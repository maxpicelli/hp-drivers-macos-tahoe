#!/bin/bash

# HP Drivers Installer - Script de Instalação Completa
# Versão: 3.4.0 Tahoe beta 8 +
# Compatível com macOS Tahoe

echo "=== HP Drivers Installer para macOS Tahoe ==="
echo "Versão: 3.4.0 Tahoe beta 8 +"
echo ""

# Verificar se o Git está instalado
if ! command -v git &> /dev/null; then
    echo "❌ ERRO: Git não está instalado"
    echo "Instale o Git primeiro: https://git-scm.com/download/mac"
    exit 1
fi

# Verificar se estamos no macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
    echo "❌ ERRO: Este script é apenas para macOS"
    exit 1
fi

# Diretório de instalação
INSTALL_DIR="$HOME/hp-drivers-macos-tahoe"
REPO_URL="https://github.com/maxpicelli/hp-drivers-macos-tahoe.git"

echo "📦 Iniciando instalação dos drivers HP..."
echo ""

# Verificar se o diretório já existe
if [ -d "$INSTALL_DIR" ]; then
    echo "⚠️  Diretório já existe: $INSTALL_DIR"
    read -p "Deseja atualizar? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo "🔄 Atualizando repositório..."
        cd "$INSTALL_DIR"
        git pull origin main
    else
        echo "❌ Instalação cancelada"
        exit 1
    fi
else
    echo "📥 Baixando drivers HP do GitHub..."
    git clone "$REPO_URL" "$INSTALL_DIR"
    
    if [ $? -ne 0 ]; then
        echo "❌ ERRO: Falha ao baixar do GitHub"
        exit 1
    fi
fi

# Entrar no diretório
cd "$INSTALL_DIR"

echo ""
echo "✅ Download concluído!"
echo "📁 Localização: $INSTALL_DIR"
echo ""

# Verificar se os executáveis existem
if [ ! -f "HP_Drivers_Installer_Auto" ]; then
    echo "❌ ERRO: Executável não encontrado"
    exit 1
fi

# Tornar executável
chmod +x HP_Drivers_Installer_Auto
chmod +x HP_Drivers_Uninstaller_Auto

echo "🚀 Executando instalador automático..."
echo ""

# Executar o instalador
./HP_Drivers_Installer_Auto

echo ""
echo "✅ Instalação concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Reinicie o Mac"
echo "2. Conecte sua impressora HP"
echo "3. Adicione a impressora em Preferências do Sistema"
echo ""
echo "🗑️  Para desinstalar: cd $INSTALL_DIR && ./HP_Drivers_Uninstaller_Auto"
echo ""
echo "📁 Arquivos em: $INSTALL_DIR"
