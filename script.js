let rotation = 0;

function spinWheel() {
  const wheel = document.getElementById('wheel');
  const randomDegrees = Math.floor(Math.random() * 360) + 720;
  rotation += randomDegrees;
  wheel.style.transform = `rotate(${rotation}deg)`;
}

function toggleDetails() {
  const list = document.getElementById('it-list');
  list.classList.toggle('hidden');
}