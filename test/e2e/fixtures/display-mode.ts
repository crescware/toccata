'use strict';

export default function displayMode(toccata: any) {
  const id = 'toccata-mode';
  window.addEventListener('DOMContentLoaded', () => {
    if (!document.getElementById(id)) {return}
    document.getElementById(id).innerText = toccata.operatingMode;
  });
}
