'use strict';

/**
 * Amőba játék — Játékos (X) vs. Játékos (O)
 * Egy gépen, ugyanazzal az egérrel, felváltva lépve.
 * A pálya állapotát egy 9 elemű, egydimenziós tömb tárolja (0–8 index).
 */

// --------------------------------------------------------------------------
// Konstansok
// --------------------------------------------------------------------------

const X_JEL = 'X';
const O_JEL = 'O';
const URES = null;

const NYERO_SOROK = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // sorok
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // oszlopok
  [0, 4, 8], [2, 4, 6],            // átlók
];

// --------------------------------------------------------------------------
// Állapot
// --------------------------------------------------------------------------

let tabla = ureTablaLetrehozasa();
let aktualisJatekos = X_JEL;
let jatekVege = false;
let pontok = { X: 0, O: 0, dontetlen: 0 };

// --------------------------------------------------------------------------
// DOM elemek
// --------------------------------------------------------------------------

const tablaElem = document.getElementById('tabla');
const statuszElem = document.getElementById('statuszSzoveg');
const ujjatekGomb = document.getElementById('ujjatekGomb');
const pontXElem = document.getElementById('pontX');
const pontOElem = document.getElementById('pontO');
const pontDontetlenElem = document.getElementById('pontDontetlen');

let mezoGombok = [];

// --------------------------------------------------------------------------
// Inicializálás
// --------------------------------------------------------------------------

function inicializal() {
  mezoGombokLetrehozasa();
  ujjatekGomb.addEventListener('click', ujJatekKezdese);
  ujJatekKezdese();
}

function ureTablaLetrehozasa() {
  return new Array(9).fill(URES);
}

function mezoGombokLetrehozasa() {
  tablaElem.innerHTML = '';
  mezoGombok = [];

  for (let i = 0; i < 9; i++) {
    const gomb = document.createElement('button');
    gomb.type = 'button';
    gomb.className = 'mezo';
    gomb.setAttribute('role', 'gridcell');
    gomb.setAttribute('aria-label', `${Math.floor(i / 3) + 1}. sor, ${(i % 3) + 1}. oszlop`);
    gomb.addEventListener('click', () => mezoKattintas(i));
    tablaElem.appendChild(gomb);
    mezoGombok.push(gomb);
  }
}

// --------------------------------------------------------------------------
// Játékmenet
// --------------------------------------------------------------------------

function ujJatekKezdese() {
  tabla = ureTablaLetrehozasa();
  aktualisJatekos = X_JEL;
  jatekVege = false;

  mezoGombok.forEach((gomb) => {
    gomb.innerHTML = '';
    gomb.disabled = false;
    gomb.classList.remove('mezo--x', 'mezo--o', 'mezo--nyertes');
  });

  statuszUzenetFrissitese(`${aktualisJatekos} köre következik`);
}

function mezoKattintas(index) {
  if (jatekVege || tabla[index] !== URES) return;

  lepesVegrehajtasa(index, aktualisJatekos);

  const nyeroSor = nyeroSorKeresese(tabla, aktualisJatekos);
  if (nyeroSor) {
    jatekLezarasa(nyeroSor, `${aktualisJatekos} nyert!`, 'statusz--nyert', aktualisJatekos);
    return;
  }

  if (dontetlenVane(tabla)) {
    jatekLezarasa(null, 'Döntetlen!', 'statusz--dontetlen', 'dontetlen');
    return;
  }

  aktualisJatekos = aktualisJatekos === X_JEL ? O_JEL : X_JEL;
  statuszUzenetFrissitese(`${aktualisJatekos} köre következik`);
}

function lepesVegrehajtasa(index, jel) {
  tabla[index] = jel;

  const gomb = mezoGombok[index];
  gomb.innerHTML = `<span class="jel">${jel}</span>`;
  gomb.disabled = true;
  gomb.classList.add(jel === X_JEL ? 'mezo--x' : 'mezo--o');
}

function jatekLezarasa(nyeroSor, uzenet, statuszOsztaly, pontszamKulcs) {
  jatekVege = true;
  mezoGombok.forEach((gomb) => (gomb.disabled = true));

  if (nyeroSor) {
    nyeroSor.forEach((index) => mezoGombok[index].classList.add('mezo--nyertes'));
  }

  pontok[pontszamKulcs]++;
  pontokFrissitese();

  statuszUzenetFrissitese(uzenet, statuszOsztaly);
}

// --------------------------------------------------------------------------
// Segédfüggvények
// --------------------------------------------------------------------------

function nyeroSorKeresese(aktualisTabla, jel) {
  return NYERO_SOROK.find(
    ([a, b, c]) => aktualisTabla[a] === jel && aktualisTabla[b] === jel && aktualisTabla[c] === jel
  ) || null;
}

function dontetlenVane(aktualisTabla) {
  return aktualisTabla.every((mezo) => mezo !== URES);
}

function statuszUzenetFrissitese(szoveg, statuszOsztaly = '') {
  statuszElem.textContent = szoveg;
  statuszElem.classList.remove('statusz--nyert', 'statusz--vesztett', 'statusz--dontetlen');
  if (statuszOsztaly) statuszElem.classList.add(statuszOsztaly);
}

function pontokFrissitese() {
  pontXElem.textContent = pontok.X;
  pontOElem.textContent = pontok.O;
  pontDontetlenElem.textContent = pontok.dontetlen;
}

// --------------------------------------------------------------------------
// Indítás
// --------------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', inicializal);
