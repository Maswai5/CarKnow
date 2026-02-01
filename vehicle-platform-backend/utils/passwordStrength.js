// utils/passwordStrength.js
function scorePassword(password) {
  let score = 0;
  if (!password) return score;

  score += Math.min(10, password.length);

  const variations = {
    digits: /\d/.test(password),
    lower: /[a-z]/.test(password),
    upper: /[A-Z]/.test(password),
    symbols: /[^A-Za-z0-9]/.test(password)
  };

  score += Object.values(variations).filter(v => v).length * 5;

  const matches = password.match(/(.)\1{2,}/g);
  if (matches) score -= matches.length * 2;

  return Math.max(0, score);
}

function classifyScore(score) {
  if (score >= 20) return 'strong';
  if (score >= 12) return 'medium';
  return 'weak';
}

module.exports = { scorePassword, classifyScore };