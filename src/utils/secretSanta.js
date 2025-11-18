// Utility functions for the Secret Santa draw

/**
 * Shuffles an array using Fisher-Yates algorithm
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generates Secret Santa matches ensuring no one gets themselves
 * Returns an array of objects with { giver, receiver }
 */
export function generateSecretSantaMatches(participants) {
  if (participants.length < 3) {
    throw new Error("Minimum 3 participants required");
  }

  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    const givers = [...participants];
    const receivers = shuffleArray([...participants]);

    // Check if anyone got themselves
    const validMatch = receivers.every(
      (receiver, index) => receiver.id !== givers[index].id
    );

    if (validMatch) {
      return givers.map((giver, index) => ({
        giver: giver,
        receiver: receivers[index],
      }));
    }

    attempts++;
  }

  // Fallback: circular assignment (person i gives to person i+1)
  return participants.map((giver, index) => ({
    giver: giver,
    receiver: participants[(index + 1) % participants.length],
  }));
}
