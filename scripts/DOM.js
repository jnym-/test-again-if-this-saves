/* Opens options modal */
var modal = document.getElementById('modalBox');
var open = document.getElementById('options');
var close = document.getElementsByClassName('close')[0];

open.addEventListener('click', openOptions);
close.addEventListener('click', closeOptions);
window.addEventListener('click', outsideOptions);

function openOptions() {
  modal.style.display = 'block';
}

function closeOptions() {
  modal.style.display = 'none';
}

function outsideOptions(e) {
  if (e.target == modal) {
    modal.style.display = 'none';
  }
}

/* Hides and shows selection buttons */
var modeSelect = document.getElementsByClassName('switch-big')[0];
var selection = document.getElementsByClassName('selection')[0];
var placeholder = document.getElementsByClassName('placeholder')[0];

modeSelect.addEventListener('click', modeSelection);

function modeSelection() {
  if (mode == 'design') {
    selection.style.display = 'block';
    placeholder.style.backgroundColor = '#ccd8f0';
  }
  else {
    selection.style.display = 'none';
    placeholder.style.backgroundColor = '#f0f0ff';
  }
}