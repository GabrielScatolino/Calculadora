// ─── ESTADO DA CALCULADORA ───────────────────────────────────────────────────
  let current  = '0';    // Número que está sendo digitado ou exibido no momento
  let expr     = '';     // Expressão exibida na linha menor acima (ex: "10 +")
  let justCalc = false;  // true quando um resultado acaba de ser calculado (pressionou "=")
  let waitOp   = false;  // true quando um operador foi pressionado e aguarda o próximo número
  let lastOp   = '';     // Guarda o último operador pressionado (+, -, *, /)
 
  // ─── FUNÇÕES DE EXIBIÇÃO ─────────────────────────────────────────────────────
 
  // Atualiza o número principal no display
  // Se isErr for true, aplica a classe de erro (texto vermelho)
  function setDisplay(val, isErr) {
    const d = document.getElementById('display');
    d.textContent = val;
    d.className = 'display-main' + (isErr ? ' error' : '');
  }
 
  // Atualiza a linha de expressão menor (acima do número principal)
  function setExpr(val) { document.getElementById('expr').textContent = val; }
 
  // ─── ENTRADA DE NÚMEROS ──────────────────────────────────────────────────────
 
  // Chamada quando o usuário pressiona um botão numérico (0–9)
  function pressNum(n) {
    if (justCalc) {
      // Se acabou de calcular um resultado, começa um número novo do zero
      current = n; expr = ''; justCalc = false; waitOp = false;
    } else if (waitOp) {
      // Se está esperando o segundo número após um operador, inicia novo número
      current = n; waitOp = false;
    } else {
      // Caso normal: concatena o dígito ao número atual
      // Se o atual for "0", substitui em vez de concatenar (evita "007")
      current = current === '0' ? n : current + n;
    }
    setDisplay(current);
  }
 
  // Adiciona ponto decimal ao número atual
  function pressDot() {
    // Se acabou de calcular ou está esperando operador, começa com "0."
    if (justCalc || waitOp) { current = '0.'; justCalc = false; waitOp = false; setDisplay(current); return; }
    // Só adiciona o ponto se ainda não houver um no número atual
    if (!current.includes('.')) { current += '.'; setDisplay(current); }
  }
 
  // ─── OPERADORES ──────────────────────────────────────────────────────────────
 
  // Converte o símbolo interno do operador para o símbolo visual exibido na tela
  // Ex: '*' vira '×', '/' vira '÷'
  function opSymbol(op) { return { '+': '+', '-': '−', '*': '×', '/': '÷' }[op] || op; }
 
  // Chamada quando o usuário pressiona +, −, ×, ÷
  function pressOp(op) {
    justCalc = false;
    // Se já existe uma expressão em andamento (operação encadeada), calcula antes de continuar
    // Ex: usuário digitou "5 + 3" e agora pressiona "×" → calcula 8 primeiro
    if (!waitOp && expr !== '') calculate(true);
    // Monta a expressão da linha superior: número atual + símbolo do operador
    expr   = current + ' ' + opSymbol(op);
    lastOp = op;    // Salva o operador para usar no cálculo
    waitOp = true;  // Sinaliza que agora aguarda o segundo número
    setExpr(expr);
  }
 
  // ─── CÁLCULO ─────────────────────────────────────────────────────────────────
 
  // Realiza o cálculo com base na expressão acumulada
  // chain = true quando chamado internamente (operação encadeada), false quando o usuário pressiona "="
  function calculate(chain) {
    if (expr === '') return; // Nada a calcular se não houver expressão
 
    // Separa a expressão em partes: ["10", "÷"] por exemplo
    const parts = expr.trim().split(' ');
    const a  = parseFloat(parts[0]); // Primeiro número (lado esquerdo da operação)
    const b  = parseFloat(current);  // Segundo número (número atual no display)
    const op = lastOp;               // Operador salvo anteriormente
    let result;
 
    // Executa a operação matemática correta
    if      (op === '+') result = a + b;
    else if (op === '-') result = a - b;
    else if (op === '*') result = a * b;
    else if (op === '/') {
      if (b === 0) {
        // Divisão por zero não é permitida — exibe erro e reseta
        setDisplay('Erro: ÷ 0', true);
        expr = ''; current = '0'; justCalc = true; setExpr('');
        return;
      }
      result = a / b;
    } else return;
 
    // Limita a precisão a 12 dígitos significativos para evitar erros de ponto flutuante
    // Ex: 0.1 + 0.2 em JS dá 0.30000000000000004 — toPrecision(12) corrige isso
    const rounded = parseFloat(result.toPrecision(12));
 
    // Se for inteiro, exibe sem casas decimais; se não, limita a 12 caracteres
    const display = Number.isInteger(rounded)
      ? rounded.toString()
      : rounded.toString().substring(0, 12);
 
    if (!chain) {
      // Quando o usuário pressiona "=", exibe a expressão completa com "=" na linha superior
      setExpr(parts[0] + ' ' + opSymbol(op) + ' ' + current + ' =');
      justCalc = true; // Marca que o resultado foi calculado
      expr = '';       // Limpa a expressão interna
    }
 
    current = display;    // O resultado vira o número atual
    setDisplay(current);
  }
 
  // ─── FUNÇÕES AUXILIARES ───────────────────────────────────────────────────────
 
  // Limpa tudo e volta ao estado inicial (botão C)
  function clearCal() {
    current = '0'; expr = ''; justCalc = false; waitOp = false; lastOp = '';
    setDisplay('0'); setExpr('');
  }
 
  // Remove o último dígito digitado (botão ⌫ Apagar)
  function deleteLast() {
    // Se acabou de calcular um resultado, apagar limpa tudo
    if (justCalc) { clearCal(); return; }
    // Remove o último caractere; se sobrar vazio, volta para "0"
    current = current.length <= 1 ? '0' : current.slice(0, -1);
    setDisplay(current);
  }
 
  // Inverte o sinal do número atual: positivo vira negativo e vice-versa (botão +/-)
  function toggleSign() {
    if (current === '0') return; // Zero não muda de sinal
    current = current.startsWith('-') ? current.slice(1) : '-' + current;
    setDisplay(current);
  }
 
  // Converte o número atual para porcentagem, dividindo por 100 (botão %)
  function applyPercent() {
    const val = parseFloat(current);
    if (isNaN(val)) return; // Ignora se não for um número válido
    current = (val / 100).toString();
    setDisplay(current);
  }
 
  // Calcula a raiz quadrada do número atual (botão √)
  function pressSqrt() {
    const val = parseFloat(current);
    // Raiz de número negativo não existe nos reais — exibe erro
    if (val < 0) { setDisplay('Erro: √ negativo', true); return; }
    setExpr('√' + current); // Mostra "√10" na linha de expressão, por exemplo
    current = parseFloat(Math.sqrt(val).toPrecision(12)).toString();
    setDisplay(current);
    justCalc = true; // Trata o resultado como se tivesse sido calculado
  }
 
  // Eleva o número atual ao quadrado (botão x²)
  function pressSquare() {
    const val = parseFloat(current);
    setExpr(current + '²'); // Mostra "5²" na linha de expressão
    current = parseFloat((val * val).toPrecision(12)).toString();
    setDisplay(current);
    justCalc = true; // Trata o resultado como se tivesse sido calculado
  }
 
  // ─── SUPORTE AO TECLADO ───────────────────────────────────────────────────────
  // Permite usar a calculadora pelo teclado físico, não só pelos botões na tela
  document.addEventListener('keydown', (e) => {
    if ('0123456789'.includes(e.key))            pressNum(e.key);   // Dígitos 0–9
    else if (e.key === '.')                       pressDot();         // Ponto decimal
    else if (['+','-','*','/'].includes(e.key))  pressOp(e.key);    // Operadores
    else if (e.key === 'Enter' || e.key === '=') calculate(false);  // Calcular
    else if (e.key === 'Backspace')              deleteLast();       // Apagar dígito
    else if (e.key === 'Escape')                 clearCal();         // Limpar tudo
  });
