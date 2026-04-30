  let current  = '0';
  let expr     = '';
  let justCalc = false;
  let waitOp   = false;
  let lastOp   = '';
 
  function setDisplay(val, isErr) {
    const d = document.getElementById('display');
    d.textContent = val;
    d.className = 'display-main' + (isErr ? ' error' : '');
  }
  function setExpr(val) { document.getElementById('expr').textContent = val; }
 
  function pressNum(n) {
    if (justCalc) { current = n; expr = ''; justCalc = false; waitOp = false; }
    else if (waitOp) { current = n; waitOp = false; }
    else { current = current === '0' ? n : current + n; }
    setDisplay(current);
  }
 
  function pressDot() {
    if (justCalc || waitOp) { current = '0.'; justCalc = false; waitOp = false; setDisplay(current); return; }
    if (!current.includes('.')) { current += '.'; setDisplay(current); }
  }
 
  function opSymbol(op) { return { '+': '+', '-': '−', '*': '×', '/': '÷' }[op] || op; }
 
  function pressOp(op) {
    justCalc = false;
    if (!waitOp && expr !== '') calculate(true);
    expr   = current + ' ' + opSymbol(op);
    lastOp = op;
    waitOp = true;
    setExpr(expr);
  }
 
  function calculate(chain) {
    if (expr === '') return;
    const parts = expr.trim().split(' ');
    const a  = parseFloat(parts[0]);
    const b  = parseFloat(current);
    const op = lastOp;
    let result;
 
    if      (op === '+') result = a + b;
    else if (op === '-') result = a - b;
    else if (op === '*') result = a * b;
    else if (op === '/') {
      if (b === 0) {
        setDisplay('Erro: ÷ 0', true);
        expr = ''; current = '0'; justCalc = true; setExpr('');
        return;
      }
      result = a / b;
    } else return;
 
    const rounded = parseFloat(result.toPrecision(12));
    const display = Number.isInteger(rounded)
      ? rounded.toString()
      : rounded.toString().substring(0, 12);
 
    if (!chain) {
      setExpr(parts[0] + ' ' + opSymbol(op) + ' ' + current + ' =');
      justCalc = true;
      expr = '';
    }
    current = display;
    setDisplay(current);
  }
 
  function clearCal() {
    current = '0'; expr = ''; justCalc = false; waitOp = false; lastOp = '';
    setDisplay('0'); setExpr('');
  }
 
  function deleteLast() {
    if (justCalc) { clearCal(); return; }
    current = current.length <= 1 ? '0' : current.slice(0, -1);
    setDisplay(current);
  }
 
  function toggleSign() {
    if (current === '0') return;
    current = current.startsWith('-') ? current.slice(1) : '-' + current;
    setDisplay(current);
  }
 
  function applyPercent() {
    const val = parseFloat(current);
    if (isNaN(val)) return;
    current = (val / 100).toString();
    setDisplay(current);
  }
 
  function pressSqrt() {
    const val = parseFloat(current);
    if (val < 0) { setDisplay('Erro: √ negativo', true); return; }
    setExpr('√' + current);
    current = parseFloat(Math.sqrt(val).toPrecision(12)).toString();
    setDisplay(current);
    justCalc = true;
  }
 
  function pressSquare() {
    const val = parseFloat(current);
    setExpr(current + '²');
    current = parseFloat((val * val).toPrecision(12)).toString();
    setDisplay(current);
    justCalc = true;
  }
 
  // Suporte ao teclado
  document.addEventListener('keydown', (e) => {
    if ('0123456789'.includes(e.key))           pressNum(e.key);
    else if (e.key === '.')                      pressDot();
    else if (['+','-','*','/'].includes(e.key)) pressOp(e.key);
    else if (e.key === 'Enter' || e.key === '=') calculate(false);
    else if (e.key === 'Backspace')              deleteLast();
    else if (e.key === 'Escape')                 clearCal();
  });
