// Random Forest Intuition Quiz
// Plain vanilla JS, no frameworks. Two-level decision trees (root + 2 leaves).
// The user sees multiple trees and a test point description. They must predict the forest's
// majority class vote (binary classes 0/1). After guessing, we reveal per-tree votes.

(function() {
  'use strict';

  // Configurable feature space: We'll use two numerical features x1 and x2 ~ Uniform(0, 1).
  // Trees are depth 2: root split on either x1 or x2 with a threshold; leaves assign constant class.
  // To keep it educational, thresholds are chosen from a discrete grid for easy mental reasoning.

  const state = {
    trees: [],
    point: null,
    votes: [],
    majority: null,
  };

  const gridThresholds = [0.2, 0.35, 0.5, 0.65, 0.8];

  function randChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
  function coin() { return Math.random() < 0.5; }

  // Generate a single random depth-2 tree (root + 2 leaves) with: feature, threshold, leafClassLeft, leafClassRight
  function generateTree(index) {
    const feature = coin() ? 'x1' : 'x2';
    const threshold = randChoice(gridThresholds);
    // Guarantee leaves differ sometimes; give a small chance they are the same (less informative) but mostly different.
    let left = coin() ? 0 : 1;
    let right = coin() ? 0 : 1;
    if (left === right && Math.random() < 0.7) { // encourage variety
      right = 1 - left;
    }
    return { id: index, feature, threshold, left, right };
  }

  function generatePoint() {
    return {
      x1: +(Math.random()).toFixed(2),
      x2: +(Math.random()).toFixed(2)
    };
  }

  function evalTree(tree, point) {
    const value = point[tree.feature];
    return value <= tree.threshold ? tree.left : tree.right;
  }

  function computeVotes() {
    state.votes = state.trees.map(t => evalTree(t, state.point));
    const sum = state.votes.reduce((a, b) => a + b, 0);
    // majority: if tie (shouldn't happen with odd number) we default to 1 if sum*2 > n else 0
    state.majority = sum * 2 > state.votes.length ? 1 : 0;
  }
  const classLabel = c => c === 0 ? 'Red' : 'Blue';

  // Rendering --------------------------------------------------------
  const treesContainer = document.getElementById('treesContainer');
  const votesContainer = document.getElementById('votesContainer');
  const forestResultEl = document.getElementById('forestResult');
  const pointDescriptionEl = document.getElementById('pointDescription');
  const feedbackEl = document.getElementById('feedback');
  const votesSection = document.getElementById('votesSection');

  function renderPoint() {
    pointDescriptionEl.textContent = `Test point: x1 = ${state.point.x1.toFixed(2)}, x2 = ${state.point.x2.toFixed(2)}`;
  }

  function renderTrees(hideVotes) {
    treesContainer.innerHTML = '';

    // Legend removed for clarity.

    state.trees.forEach(tree => {
      const vote = evalTree(tree, state.point);
      const votedLeft = (state.point[tree.feature] <= tree.threshold);
      const div = document.createElement('div');
      div.className = 'tree';
      if (hideVotes) div.classList.add('pre-guess'); // hide vote badge only; keep tree visible

      // Coordinates (simple static layout): root at (100,30); left leaf at (55,100); right leaf at (145,100)
      const rootX = 100, rootY = 30, leftX = 55, rightX = 145, leafY = 100;
      const leftClass = tree.left, rightClass = tree.right;
      const highlightLeft = !hideVotes && votedLeft;
      const highlightRight = !hideVotes && !votedLeft;
      const leftVoteClass = highlightLeft ? 'vote-' + leftClass + ' vote-highlight' : '';
      const rightVoteClass = highlightRight ? 'vote-' + rightClass + ' vote-highlight' : '';

      div.innerHTML = `
        <div class="vote-badge">${vote}</div>
        <header><h3 class="tree-title">Tree ${tree.id + 1}</h3></header>
        <div class="tree-svg-wrapper">
          <svg class="tree-svg" viewBox="0 0 200 140" role="img" aria-label="Decision tree ${tree.id + 1} splitting on ${tree.feature} ≤ ${tree.threshold.toFixed(2)}">
            <line class="edge left" x1="${rootX}" y1="${rootY+8}" x2="${leftX}" y2="${leafY-12}" />
            <line class="edge" x1="${rootX}" y1="${rootY+8}" x2="${rightX}" y2="${leafY-12}" />
            <circle class="node-circle" cx="${rootX}" cy="${rootY}" r="14" />
            <text class="node-label" x="${rootX}" y="${rootY+3}" text-anchor="middle">${tree.feature} ≤ ${tree.threshold.toFixed(2)}</text>
            <circle class="leaf-circle leaf-class-${leftClass} ${leftVoteClass}" cx="${leftX}" cy="${leafY}" r="16" />
            <text class="node-label" x="${leftX}" y="${leafY+3}" text-anchor="middle">${classLabel(leftClass)}</text>
            <circle class="leaf-circle leaf-class-${rightClass} ${rightVoteClass}" cx="${rightX}" cy="${leafY}" r="16" />
            <text class="node-label" x="${rightX}" y="${leafY+3}" text-anchor="middle">${classLabel(rightClass)}</text>
          </svg>
        </div>
      `;
      treesContainer.appendChild(div);
    });
  }

  function renderVotesReveal() {
    votesContainer.innerHTML = '';
    state.votes.forEach((v, i) => {
      const chip = document.createElement('div');
      chip.className = 'vote-chip class-' + v;
    chip.innerHTML = `<span class="num">T${i + 1}</span> vote: <strong>${classLabel(v)}</strong>`;
      votesContainer.appendChild(chip);
    });
    const count1 = state.votes.filter(v => v === 1).length;
    const count0 = state.votes.length - count1;
    forestResultEl.textContent = `Forest majority: ${classLabel(state.majority)} (Red: ${count0}, Blue: ${count1})`;
  }

  // Interaction ------------------------------------------------------
  function newQuestion() {
    const treeCountInput = document.getElementById('treeCount');
    let n = parseInt(treeCountInput.value, 10) || 5;
    if (n < 3) n = 3; if (n > 15) n = 15; if (n % 2 === 0) n += 1; // ensure odd for majority clarity
    treeCountInput.value = n;

    state.trees = Array.from({ length: n }, (_, i) => generateTree(i));
    state.point = generatePoint();
    computeVotes();
    votesSection.classList.add('hidden');
    feedbackEl.textContent = '';
    feedbackEl.className = '';
    renderPoint();
    renderTrees(true);
  }

  function handleGuess(guessClass) {
    if (!state.trees.length) return;
    const correct = guessClass === state.majority;
  // Use color label in feedback
  feedbackEl.textContent = correct ? 'Correct! 🎉' : `Incorrect. Forest predicts ${classLabel(state.majority)}.`;
    feedbackEl.className = correct ? 'correct' : 'incorrect';
    votesSection.classList.remove('hidden');
    renderTrees(false); // show votes & highlight path
    renderVotesReveal();
  }

  function bindEvents() {
    document.getElementById('newQuestionBtn').addEventListener('click', newQuestion);
    document.querySelectorAll('.guess-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const cls = parseInt(btn.getAttribute('data-class'), 10);
        handleGuess(cls);
      });
    });
  }

  // Initialize
  bindEvents();
  newQuestion();
})();
