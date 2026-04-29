function appendCal(text) {
     const display = document.getElementById("display");
     display.append(text);
}

function clearCal() {
     document.getElementById("display").innerText = ""; //esse innerText serve para limpar a calculadora
}

function calculate() {
     const display = document.getElementById("display");
     let result = eval(display.innerText); //esse innerText pega o texto do display
     display.innerText = result;           //insere o resultado no display
}