# Log de Atividades - TPC#3 (Automated Acceptance Tests)

**Aluno:** [Teu Nome]
**Disciplina:** Engenharia de Software
**Corpo:** Projeto UniLink

## 1. Objetivos do Trabalho (Goals)
- Experimentar o uso de testes de aceitação automatizados num cenário real.
- Configurar e integrar o **Maestro** (UI Automation) numa aplicação React Native com Expo.
- Automatizar o cenário: "Como estudante, quero pedir uma boleia para poder ir para a universidade."

## 2. Ferramentas Utilizadas (Tools)
- **Framework:** React Native (Expo)
- **Automação:** Maestro (mobile.dev)
- **IA:** Antigravity (Google DeepMind) para auxiliar na especificação dos testes e integração.

## 3. Comandos e Prompts (Execution Log)

### Instalação e Configuração
1.  **Instalação do Maestro CLI**:
    ```bash
    curl -Ls "https://get.maestro.mobile.dev" | bash
    ```
2.  **Configuração do Projeto**:
    - Adição de `testID`s no componente `RideRequestScreen.tsx`.
    - Configuração de `android.package` e `ios.bundleIdentifier` no `app.json`.
    - Adição do script `"test:maestro": "maestro test maestro/"` no `package.json`.

### Prompts de IA (Exemplos)
- *"Qual ferramenta de teste de aceitação é melhor para Expo?"*
- *"Como configuro o Maestro para testar num cenário de pedido de boleia?"*
- *"Corrige o meu ficheiro .yaml para usar os testIDs que já defini no código."*
- *"O comando waitMs não funciona no Maestro, como posso esperar pelo carregamento?"*
- *"O Maestro não encontra a Tab no iOS, como posso tornar a seleção mais robusta?"*

## 4. Cenário de Aceitação Automatizado
O cenário escolhido foi o **Pedido de uma Boleia**.

**Filtro/Flow (`maestro/01_criar_boleia.yaml`):**
1.  Lançar a aplicação.
2.  Navegar para a tab "Boleia" (usando `testID` para maior robustez).
3.  Preencher localização de encontro ("FEUP, Porto").
4.  Preencher destino ("Trindade, Porto").
5.  Clicar em "Confirmar Pedido".
6.  Verificar mensagem de sucesso: "Pedido de Boleia Confirmado!".

## 5. Análise Crítica
- **Facilidade de Uso**: O Maestro revelou-se extremamente intuitivo por usar YAML em vez de código complexo de UI (como Appium ou Selenium).
- **Desafios no iOS/Expo Go**: Durante a implementação, identificaram-se dificuldades na seleção de elementos da Tab Bar no iOS. A solução passou por utilizar `tabBarAccessibilityLabel` em vez de apenas texto, o que tornou o teste agnóstico à plataforma.
- **Sintaxe e Comandos**: Aprendi que o Maestro não utiliza comandos de espera fixos (`waitMs`), forçando o desenvolvedor a utilizar asserções inteligentes (`assertVisible`), o que resulta em testes mais rápidos e estáveis.
- **Indentação YAML**: A sensibilidade do YAML à indentação foi um ponto crítico durante a escrita manual do fluxo, corrigida com a ajuda da IA.
- **Eficiência**: A automação deste cenário reduz o tempo de testes manuais em cada nova iteração da app, garantindo que o fluxo principal não regride.
- **Limitação**: No ambiente Expo Go, é necessário garantir que o servidor de desenvolvimento está ativo, o que pode ser uma dependência extra comparado a builds standalone.
