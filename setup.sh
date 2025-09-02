#!/bin/bash

# Script de configuração para HP Drivers Installer
# Torna os scripts executáveis e prepara o ambiente

echo "=== Configuração HP Drivers Installer ==="
echo ""

# Tornar scripts executáveis
echo "Tornando scripts executáveis..."
chmod +x install_hp_drivers.sh
chmod +x uninstall_hp_drivers.sh
echo "✓ Scripts tornados executáveis"

# Verificar se os arquivos estão presentes
echo ""
echo "Verificando arquivos dos drivers..."
if [ -d "Library" ]; then
    echo "✓ Pasta Library encontrada"
else
    echo "✗ Pasta Library não encontrada"
fi

if [ -d "usr" ]; then
    echo "✓ Pasta usr encontrada"
else
    echo "✗ Pasta usr não encontrada"
fi

if [ -d "Library/Extensions/hp_io_enabler_compound.kext" ]; then
    echo "✓ Kernel extension encontrado"
else
    echo "✗ Kernel extension não encontrado"
fi

if [ -d "Library/Printers/hp" ]; then
    echo "✓ Drivers de impressora encontrados"
else
    echo "✗ Drivers de impressora não encontrados"
fi

echo ""
echo "=== Configuração Concluída ==="
echo ""
echo "Para instalar os drivers HP:"
echo "sudo ./install_hp_drivers.sh"
echo ""
echo "Para desinstalar os drivers HP:"
echo "sudo ./uninstall_hp_drivers.sh"
echo ""
echo "Para mais informações, consulte o arquivo README.md"
