// @name         AUTOJR🌨⛈ - Painel Redondo Compacto
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Painel redondo fofo compacto, verde bebê, título AUTOJR, contador funcional e cliques automáticos.
// @match        https://aviator-next.spribegaming.com/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    /********** CONFIGURAÇÕES GERAIS **********/
    let isActive = false;
    let intervalMs = 60000;
    let intervalId, countdownId, countdownSeconds;
    let isDragging = false;
    let dragOffsetX = 0, dragOffsetY = 0;
    let retryTimeoutId = null;

    function parseInputValue(val) {
        let num = parseFloat(val);
        if (isNaN(num) || num < 0) return 60000;
        const decimalPart = num - Math.floor(num);
        if (Math.abs(decimalPart - 0.01) < 0.00001) return 5000;
        return num * 60000;
    }

    function updateInterval() {
        if (intervalId) clearInterval(intervalId);
        intervalId = setInterval(() => { attemptClick(); resetCountdown(); }, intervalMs);
        resetCountdown();
    }

    function resetCountdown() {
        countdownSeconds = Math.floor(intervalMs / 1000);
        updateCountdownDisplay();
        if (countdownId) clearInterval(countdownId);
        countdownId = setInterval(() => {
            countdownSeconds--;
            if (countdownSeconds < 0) countdownSeconds = 0;
            updateCountdownDisplay();
        }, 1000);
    }

    function updateCountdownDisplay() {
        const min = Math.floor(countdownSeconds / 60);
        const sec = countdownSeconds % 60;
        countdownSpan.textContent = `${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
    }

    /********** CRIAÇÃO DO PAINEL REDONDO COMPACTO **********/
    const panel = document.createElement('div');
    Object.assign(panel.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        backgroundColor: '#A8E6CF', // verde bebê fofo
        padding: '8px',
        borderRadius: '10%',          // redondo
        width: '120px',
        height: '120px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        fontFamily: '"Comic Sans MS", cursive, sans-serif',
        cursor: 'move',
        userSelect: 'none',
        color: '#333'
    });

    // Título
    const titulo = document.createElement('div');
    titulo.textContent = 'AUTOJR';
    Object.assign(titulo.style, {
        fontWeight: 'bold',
        fontSize: '16px',
        color: '#76C7C0',
        margin: '0',
        textAlign: 'center'
    });

    // Botão ON/OFF
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = 'OFF';
    Object.assign(toggleBtn.style, {
        padding: '4px 8px',
        fontSize: '14px',
        borderRadius: '10px',
        backgroundColor: '#CFFFE5',
        color: '#333',
        border: '1px solid #76C7C0',
        cursor: 'pointer',
        fontWeight: 'bold',
        margin: '2px 0'
    });

    // Input de tempo
    const input = document.createElement('input');
    input.type = 'number';
    input.min = 0;
    input.step = '0.01';
    input.value = '1';
    input.title = 'Tempo (1.01 = 5s, outros valores em minutos)';
    Object.assign(input.style, {
        width: '50px',
        padding: '2px',
        fontSize: '14px',
        borderRadius: '10px',
        height: '24px',
        backgroundColor: '#CFFFE5',
        color: '#333',
        border: '1px solid #76C7C0',
        textAlign: 'center',
        margin: '2px 0'
    });

    // Contador
    const countdownSpan = document.createElement('div');
    countdownSpan.textContent = '00:00';
    Object.assign(countdownSpan.style, {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#333',
        margin: '2px 0'
    });

    panel.appendChild(titulo);
    panel.appendChild(toggleBtn);
    panel.appendChild(input);
    panel.appendChild(countdownSpan);
    document.body.appendChild(panel);

    // Drag
    panel.addEventListener('mousedown', (e) => {
        if (e.target === toggleBtn || e.target === input) return;
        isDragging = true;
        dragOffsetX = e.clientX - panel.getBoundingClientRect().left;
        dragOffsetY = e.clientY - panel.getBoundingClientRect().top;
        e.preventDefault();
    });
    document.addEventListener('mouseup', () => { isDragging = false; });
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        let newLeft = e.clientX - dragOffsetX;
        let newTop = e.clientY - dragOffsetY;
        const maxLeft = window.innerWidth - panel.offsetWidth;
        const maxTop = window.innerHeight - panel.offsetHeight;
        if (newLeft < 0) newLeft = 0;
        if (newTop < 0) newTop = 0;
        if (newLeft > maxLeft) newLeft = maxLeft;
        if (newTop > maxTop) newTop = maxTop;
        panel.style.left = newLeft + 'px';
        panel.style.top = newTop + 'px';
        panel.style.right = 'auto';
    });

    input.addEventListener('change', () => {
        intervalMs = parseInputValue(input.value);
        if (isActive) updateInterval();
    });

    toggleBtn.addEventListener('click', () => {
        isActive = !isActive;
        toggleBtn.textContent = isActive ? 'ON' : 'OFF';
        if (isActive) { attemptClick(); updateInterval(); }
        else { clearInterval(intervalId); clearInterval(countdownId); if (retryTimeoutId) clearTimeout(retryTimeoutId); countdownSpan.textContent = '00:00'; }
    });

    function simulateClick(el) { ['mousedown','mouseup','click'].forEach(t => el.dispatchEvent(new MouseEvent(t, {bubbles:true,cancelable:true,view:window}))); }

    function attemptClick() {
        if (!isActive) return;
        const button = document.querySelector('.buttons-block button.bet');
        if (button && button.querySelector('label.label')) {
            const text = button.querySelector('label.label').textContent.trim().toLowerCase();
            if (text === 'aposta' || text === 'bet') { simulateClick(button); if(retryTimeoutId){clearTimeout(retryTimeoutId); retryTimeoutId=null;} return; }
        }
        if (isActive && !retryTimeoutId) { retryTimeoutId = setTimeout(()=>{retryTimeoutId=null; attemptClick();},3000); }
    }

    /********** AUTOJR DINÂMICO **********/
    (function () {
        const DELAY = 1;
        const DOUBLE_CLICK_DELAY = 1;
        let clicando = false;

        function pegarBotoesChuva() {
            const botoes = [...document.querySelectorAll("app-chat-message-rain button, app-chat-rain button")];
            return botoes.filter(b => b.offsetParent !== null && !b.dataset.clicado);
        }

        function clicar(el) {
            const rect = el.getBoundingClientRect();
            ["mousedown","mouseup","click"].forEach(t => el.dispatchEvent(new MouseEvent(t,{bubbles:true,cancelable:true,view:window,clientX:rect.left+5,clientY:rect.top+5})));
        }

        function embaralhar(arr) { for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]];} return arr; }

        async function clicarBotoes() {
            if(clicando) return;
            clicando=true;
            document.querySelectorAll("app-chat-message-rain button, app-chat-rain button").forEach(b=>delete b.dataset.clicado);
            const botoes=embaralhar(pegarBotoesChuva());
            for(const btn of botoes){
                try{for(let i=0;i<3;i++){clicar(btn); await new Promise(r=>setTimeout(r,DOUBLE_CLICK_DELAY));} btn.dataset.clicado="true";}catch(e){}
                await new Promise(r=>setTimeout(r,DELAY));
            }
            clicando=false;
        }

        const observer = new MutationObserver(mutations=>{
            if(mutations.some(m=>[...m.addedNodes].some(n=>n.querySelector&&(n.querySelector("app-chat-message-rain")||n.querySelector("app-chat-rain"))))) clicarBotoes();
        });
        observer.observe(document.body,{childList:true,subtree:true});
    })();

    /********** AUTOJR ALEATÓRIO SIMPLES **********/
    (function () {
        const DELAY = 1;
        const DOUBLE_CLICK_DELAY = 1;
        let clicandoChuva=false;

        function pegarBotoesChuvaXPath() {
            const xpath="/html/body/app-root/app-game//app-chat-rain//button";
            const resultados=[];
            const iterator=document.evaluate(xpath,document,null,XPathResult.ORDERED_NODE_ITERATOR_TYPE,null);
            let node=iterator.iterateNext();
            while(node){resultados.push(node); node=iterator.iterateNext();}
            return resultados.filter(b=>b.offsetParent!==null && !b.dataset.clicado);
        }

        function clicarElemento(el){
            const rect=el.getBoundingClientRect();
            ["mousedown","mouseup","click"].forEach(t=>el.dispatchEvent(new MouseEvent(t,{bubbles:true,cancelable:true,view:window,clientX:rect.left+5,clientY:rect.top+5})));
        }

        function embaralharArray(array){
            for(let i=array.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [array[i],array[j]]=[array[j],array[i]];} return array;
        }

        async function clicarBotoesChuva(){
            if(clicandoChuva) return;
            clicandoChuva=true;
            document.querySelectorAll("app-chat-rain button").forEach(b=>delete b.dataset.clicado);
            let botoes=pegarBotoesChuvaXPath();
            let alvo=embaralharArray([...botoes]);
            for(const botao of alvo){
                try{for(let i=0;i<3;i++){clicarElemento(botao); await new Promise(r=>setTimeout(r,DOUBLE_CLICK_DELAY));} botao.dataset.clicado="true";}catch(e){}
                await new Promise(r=>setTimeout(r,DELAY));
            }
            clicandoChuva=false;
        }

        const observer=new MutationObserver(mutations=>{
            if(mutations.some(m=>m.addedNodes.length>0 && [...m.addedNodes].some(n=>n.querySelector&&n.querySelector("app-chat-rain")))) clicarBotoesChuva();
        });
        observer.observe(document.body,{childList:true,subtree:true});
    })();

})();
