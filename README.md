# HP Drivers Installer para macOS Tahoe

[![macOS](https://img.shields.io/badge/macOS-Tahoe%2015.0+-blue.svg)](https://www.apple.com/macos/)
[![Version](https://img.shields.io/badge/Version-3.4.0%20Tahoe%20beta%208+-green.svg)](https://github.com/maxpicelli/hp-drivers-macos-tahoe)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/badge/GitHub-maxpicelli%2Fhp--drivers--macos--tahoe-brightgreen.svg)](https://github.com/maxpicelli/hp-drivers-macos-tahoe)

Este pacote contém drivers HP versão 3.4.0 (2007-2016) adaptados para funcionar no macOS Tahoe, contornando as restrições de segurança do sistema. **Tahoe beta 8 +**

## ⚡ Quick Start

### Instalação Super Fácil (Recomendado)
```bash
# Um comando para baixar e instalar tudo
curl -sSL https://raw.githubusercontent.com/maxpicelli/hp-drivers-macos-tahoe/main/install.sh | bash
```

### Instalação Manual
```bash
# Clone e instalação manual
git clone https://github.com/maxpicelli/hp-drivers-macos-tahoe.git
cd hp-drivers-macos-tahoe
./HP_Drivers_Installer_Auto
```

## 📋 Requisitos

- macOS Tahoe (15.0 ou superior)
- Acesso de administrador
- Impressora HP compatível
- Git (opcional, para instalação via GitHub)

## 🚀 Instalação

### Opção 1: Instalação Automática Completa (Recomendado)

#### Instalação com um comando:
```bash
# Baixa tudo e instala automaticamente
curl -sSL https://raw.githubusercontent.com/maxpicelli/hp-drivers-macos-tahoe/main/install.sh | bash
```

#### Instalação manual com Git:
```bash
# Clone e instalação manual
git clone https://github.com/maxpicelli/hp-drivers-macos-tahoe.git
cd hp-drivers-macos-tahoe
./HP_Drivers_Installer_Auto
```

**Características:**
- ✅ Baixa automaticamente do GitHub
- ✅ Executa instalação automática
- ✅ Atualiza se já existir
- ✅ Verifica dependências
- ✅ Instalação completa em um comando

### Opção 2: Instalação Manual (Avançado)

**Nota:** Esta opção é para usuários avançados. Recomendamos usar os auto executáveis.

#### Passo 1: Preparar o ambiente
```bash
# Execute o script de configuração
./create_auto_sudo_executable.sh
```

#### Passo 2: Instalar os drivers
```bash
# Execute o instalador como administrador
sudo ./HP_Drivers_Installer_Auto
```

#### Passo 3: Reiniciar o sistema
Após a instalação, reinicie o Mac para garantir que o kernel extension seja carregado corretamente.

#### Passo 4: Adicionar impressora
1. Conecte sua impressora HP
2. Vá em **Preferências do Sistema** > **Impressoras e Scanners**
3. Clique no **+** para adicionar impressora
4. Selecione sua impressora HP da lista

### 🔍 Se a impressora não aparece automaticamente:

#### Opção 1: Instalar drivers via DMG
```bash
# Montar e instalar drivers HP diretos da Apple
sudo hdiutil attach "HP DRIVER SONOMA HewlettPackardPrinterDrivers-Direto Apple.dmg"
sudo installer -pkg "/Volumes/HP DRIVER SONOMA HewlettPackardPrinterDrivers-Direto Apple/HP Drivers.pkg" -target /
sudo hdiutil detach "/Volumes/HP DRIVER SONOMA HewlettPackardPrinterDrivers-Direto Apple"
```

#### Opção 2: Instalar drivers multifuncional
```bash
# Para impressoras com scanner
sudo hdiutil attach "HP 2 DRIVER SONOMA HewlettPackardPrinterDrivers-Multifuncional.dmg"
sudo installer -pkg "/Volumes/HP 2 DRIVER SONOMA HewlettPackardPrinterDrivers-Multifuncional/HP Drivers.pkg" -target /
sudo hdiutil detach "/Volumes/HP 2 DRIVER SONOMA HewlettPackardPrinterDrivers-Multifuncional"
```

#### Opção 3: Adicionar impressora manualmente
1. Vá em **Preferências do Sistema** > **Impressoras e Scanners**
2. Clique no **+** 
3. Selecione **"Adicionar impressora ou scanner"**
4. Escolha **"IP"** ou **"USB"** dependendo da conexão
5. Digite o IP da impressora ou selecione via USB
6. Escolha **"HP"** como fabricante
7. Selecione o modelo da sua impressora

#### Opção 4: Verificar conexão
```bash
# Verificar se a impressora está conectada via USB
system_profiler SPUSBDataType | grep -i hp

# Verificar se a impressora está na rede
arp -a | grep -i hp
```

## 🗑️ Desinstalação

### Auto Desinstalador (Recomendado)

#### HP_Drivers_Uninstaller_Auto
```bash
# Desinstalador automático com confirmação
./HP_Drivers_Uninstaller_Auto
```
**Características:**
- Solicita automaticamente privilégios sudo
- Confirmação interativa para cada componente
- Opção de restaurar backups
- Interface amigável

### Desinstalação Manual (Avançado)

Para remover os drivers HP:
```bash
sudo ./HP_Drivers_Uninstaller_Auto
```

O script de desinstalação oferece opções para:
- Remover componentes individualmente
- Restaurar backups dos arquivos originais
- Limpar cache do sistema

## 🔧 Scripts de Criação de Executáveis

O projeto inclui scripts para criar executáveis personalizados:

### Criar Auto Executável com Sudo
```bash
# Cria HP_Drivers_Installer_Auto
./create_auto_sudo_executable.sh
```

### Criar Auto Desinstalador com Sudo
```bash
# Cria HP_Drivers_Uninstaller_Auto
./create_auto_sudo_uninstaller.sh
```

## 📊 Comparação dos Executáveis

| Executável | Sudo Automático | Busca Inteligente | Interface | Backup | Recomendado |
|------------|----------------|-------------------|-----------|--------|-------------|
| **HP_Drivers_Installer_Auto** | ✅ | ✅ | ✅ | ✅ | **Sim** |
| **HP_Drivers_Uninstaller_Auto** | ✅ | ✅ | ✅ | ✅ | **Sim** |

### Quando usar cada executável:

- **HP_Drivers_Installer_Auto**: Para instalação automática dos drivers HP
- **HP_Drivers_Uninstaller_Auto**: Para desinstalação automática dos drivers HP

## 📦 Arquivos DMG Disponíveis

O projeto inclui dois arquivos DMG com drivers HP oficiais:

### HP DRIVER SONOMA HewlettPackardPrinterDrivers-Direto Apple.dmg
- **Tamanho**: ~584MB
- **Conteúdo**: Drivers HP diretos da Apple
- **Uso**: Para impressoras HP básicas

### HP 2 DRIVER SONOMA HewlettPackardPrinterDrivers-Multifuncional.dmg
- **Tamanho**: ~584MB
- **Conteúdo**: Drivers HP multifuncional (impressora + scanner)
- **Uso**: Para impressoras multifuncionais HP

**Nota**: Os executáveis automáticos podem usar estes arquivos DMG como fonte alternativa de drivers.

## 📁 Estrutura dos Arquivos

```
.
├── Library/
│   ├── Extensions/
│   │   └── hp_io_enabler_compound.kext/    # Kernel extension USB
│   ├── Image Capture/
│   │   └── Devices/                         # Aplicações de scanner
│   └── Printers/
│       └── hp/                              # Drivers de impressora
├── usr/
│   └── libexec/
│       └── cups/
│           └── backend/                     # Backends CUPS
├── HP_Drivers_Installer_Auto               # Auto executável com sudo
├── HP_Drivers_Uninstaller_Auto             # Auto desinstalador
├── install.sh                              # Script de instalação completa
├── create_auto_sudo_executable.sh          # Criador de auto executável
├── create_auto_sudo_uninstaller.sh         # Criador de auto desinstalador
├── HP DRIVER SONOMA HewlettPackardPrinterDrivers-Direto Apple.dmg    # Drivers HP diretos da Apple
├── HP 2 DRIVER SONOMA HewlettPackardPrinterDrivers-Multifuncional.dmg # Drivers HP multifuncional
└── README.md                               # Este arquivo

## 🔧 Componentes Instalados

### 1. Kernel Extension (kext)
- **Arquivo**: `hp_io_enabler_compound.kext`
- **Localização**: `/Library/Extensions/`
- **Função**: Habilita comunicação USB com impressoras HP

### 2. Drivers de Impressora
- **Localização**: `/Library/Printers/hp/`
- **Inclui**:
  - Drivers CUPS para várias séries HP
  - Frameworks HP
  - Utilitários e aplicações
  - Perfis de cor ICC

### 3. Aplicações Image Capture
- **Localização**: `/Library/Image Capture/Devices/`
- **Função**: Suporte para scanners HP

### 4. Backends CUPS
- **Localização**: `/usr/libexec/cups/backend/`
- **Arquivos**: `hpfax`, `hpFaxbackend`
- **Função**: Suporte para fax e impressão

## ⚠️ Notas Importantes

### Segurança do Sistema
- O macOS Sonoma tem restrições rigorosas para kernel extensions
- Pode ser necessário autorizar manualmente em **Preferências do Sistema** > **Segurança e Privacidade**
- Se aparecer uma mensagem sobre "desenvolvedor não identificado", clique em "Permitir"

### Compatibilidade
- Testado no macOS Tahoe 15.0+
- Funciona com impressoras HP das séries:
  - Deskjet
  - Officejet
  - Photosmart
  - ENVY
  - LaserJet
  - Designjet

### Backups
- O instalador cria backups automáticos dos arquivos existentes
- Backups são nomeados com timestamp: `.backup.YYYYMMDD_HHMMSS`
- Use o script de desinstalação para restaurar backups se necessário

## 🛠️ Troubleshooting

### Problema: Impressora não é detectada
1. Verifique se a impressora está conectada via USB
2. Reinicie o sistema
3. Verifique as permissões em **Preferências do Sistema** > **Segurança e Privacidade**
4. Execute: `sudo kextload /Library/Extensions/hp_io_enabler_compound.kext`

### Problema: Kernel extension não carrega
1. Verifique se o SIP está desabilitado temporariamente:
   ```bash
   csrutil status
   ```
2. Se necessário, desabilite temporariamente:
   ```bash
   csrutil disable
   # Reinicie e instale
   # Depois reabilite
   csrutil enable
   ```

### Problema: Erro de permissão
1. Execute o script como administrador: `sudo ./install_hp_drivers.sh`
2. Verifique as permissões dos arquivos:
   ```bash
   ls -la /Library/Extensions/hp_io_enabler_compound.kext
   ls -la /Library/Printers/hp/
   ```

### Problema: Serviços CUPS não funcionam
1. Reinicie os serviços:
   ```bash
   sudo launchctl unload /System/Library/LaunchDaemons/org.cups.cupsd.plist
   sudo launchctl load /System/Library/LaunchDaemons/org.cups.cupsd.plist
   ```
2. Verifique o status: `sudo launchctl list | grep cups`

## 📞 Suporte

Se encontrar problemas:
1. Verifique se todos os arquivos estão presentes
2. Execute o script de configuração: `./setup.sh`
3. Verifique os logs do sistema: `sudo log show --predicate 'process == "kernel"' --last 1h`
4. Consulte as mensagens de erro durante a instalação

## 🔄 Atualizações

Para atualizar os drivers:
1. Execute o script de desinstalação
2. Substitua os arquivos pelos novos
3. Execute o script de instalação novamente

## 📄 Licença

Este pacote contém drivers HP originais modificados para compatibilidade com macOS Sonoma. Use por sua conta e risco.

---

**Versão**: 3.4.0 Tahoe beta 8 +  
**Compatível com**: macOS Sonoma 14.0+  
**Última atualização**: 2024
