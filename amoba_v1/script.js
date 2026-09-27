'use strict';



const JATEKOS = 'X';
const GEP = 'O';
const URES = null;

const NYERO_SOROK = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], 
  [0, 3, 6], [1, 4, 7], [2, 5, 8], 
  [0, 4, 8], [2, 4, 6],            
];

const KOZEP_INDEX = 4;



let tabla = ureTablaLetrehozasa();
let jatekVege = false;
let pontok = { X: 0, O: 0, dontetlen: 0 };



const tablaElem = document.getElementById('tabla');
const statuszElem = document.getElementById('statuszSzoveg');
const ujjatekGomb = document.getElementById('ujjatekGomb');
const pontXElem = document.getElementById('pontX');
const pontOElem = document.getElementById('pontO');
const pontDontetlenElem = document.getElementById('pontDontetlen');

let mezoGombok = [];



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



function ujJatekKezdese() {
  tabla = ureTablaLetrehozasa();
  jatekVege = false;

  mezoGombok.forEach((gomb) => {
    gomb.innerHTML = '';
    gomb.disabled = false;
    gomb.classList.remove('mezo--x', 'mezo--o', 'mezo--nyertes');
  });

  statuszUzenetFrissitese('A te köröd következik');
}

function mezoKattintas(index) {
  if (jatekVege || tabla[index] !== URES) return;

  lepesVegrehajtasa(index, JATEKOS);

  const jatekosNyeroSor = nyeroSorKeresese(tabla, JATEKOS);
  if (jatekosNyeroSor) {
    jatekLezarasa(jatekosNyeroSor, 'Gratulálok, nyertél!', 'statusz--nyert', 'X');
    return;
  }

  if (dontetlenVane(tabla)) {
    jatekLezarasa(null, 'Döntetlen!', 'statusz--dontetlen', 'dontetlen');
    return;
  }

  statuszUzenetFrissitese('A gép gondolkodik…');


  setTimeout(gepLepese, 400);
}

function gepLepese() {
  if (jatekVege) return;

  const index = gepKovetkezoLepese(tabla);
  lepesVegrehajtasa(index, GEP);

  const gepNyeroSor = nyeroSorKeresese(tabla, GEP);
  if (gepNyeroSor) {
    jatekLezarasa(gepNyeroSor, 'Vesztettél :(', 'statusz--vesztett', 'O');
    return;
  }

  if (dontetlenVane(tabla)) {
    jatekLezarasa(null, 'Döntetlen!', 'statusz--dontetlen', 'dontetlen');
    return;
  }

  statuszUzenetFrissitese('A te köröd következik');
}

function lepesVegrehajtasa(index, jel) {
  tabla[index] = jel;

  const gomb = mezoGombok[index];
  gomb.innerHTML = `<span class="jel">${jel}</span>`;
  gomb.disabled = true;
  gomb.classList.add(jel === JATEKOS ? 'mezo--x' : 'mezo--o');
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



function gepKovetkezoLepese(aktualisTabla) {
  const tamadoLepes = nyeroLepesKeresese(aktualisTabla, GEP);
  if (tamadoLepes !== null) return tamadoLepes;

  const vedoLepes = nyeroLepesKeresese(aktualisTabla, JATEKOS);
  if (vedoLepes !== null) return vedoLepes;

  if (aktualisTabla[KOZEP_INDEX] === URES) return KOZEP_INDEX;

  return veletlenUresMezo(aktualisTabla);
}


function nyeroLepesKeresese(aktualisTabla, jel) {
  for (const [a, b, c] of NYERO_SOROK) {
    const sor = [aktualisTabla[a], aktualisTabla[b], aktualisTabla[c]];
    const jelekSzama = sor.filter((mezo) => mezo === jel).length;
    const uresekSzama = sor.filter((mezo) => mezo === URES).length;

    if (jelekSzama === 2 && uresekSzama === 1) {
      const uresIndexSoron = [a, b, c].find((index) => aktualisTabla[index] === URES);
      return uresIndexSoron;
    }
  }
  return null;
}

function veletlenUresMezo(aktualisTabla) {
  const uresMezok = aktualisTabla
    .map((ertek, index) => (ertek === URES ? index : null))
    .filter((index) => index !== null);

  const veletlenIndex = Math.floor(Math.random() * uresMezok.length);
  return uresMezok[veletlenIndex];
}



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


document.addEventListener('DOMContentLoaded', inicializal);
