// Load coach data from localStorage or fallback to JSON file
async function loadCoachData() {
  let data = null;
  const local = localStorage.getItem('coachData');
  if (local) {
    data = JSON.parse(local);
  } else {
    // fallback to JSON file
    const res = await fetch('data/coach-data.json');
    data = await res.json();
  }
  return data;
}

// Save coach data to localStorage (shared with current module)
function saveCoachData(data) {
  localStorage.setItem('coachData', JSON.stringify(data));
}

// Example usage in your new module
document.addEventListener('DOMContentLoaded', async () => {
  const content = document.getElementById('coach-v2-content');
  const coachData = await loadCoachData();

  function render() {
    content.innerHTML = `
      <h2>Current Selected Trainer: ${coachData.selectedTrainer ? coachData.selectedTrainer.name : 'None'}</h2>
      <button id="choose-coach-btn">Choose Sarah</button>
    `;
    document.getElementById('choose-coach-btn').onclick = () => {
      coachData.selectedTrainer = coachData.availableTrainers[0]; // Example: select Sarah
      saveCoachData(coachData);
      render();
      alert('Trainer selected! This will be reflected in both modules.');
    };
  }

  render();
}); 