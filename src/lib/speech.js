const API_BASE = import.meta.env.VITE_API_BASE || '';

export async function transcribeAudio(audioBlob, { language, questionPrev, answerPrev } = {}) {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'voice-message.wav');

  if (language) {
    formData.append('language', language);
  }
  if (questionPrev) {
    formData.append('question_prev', questionPrev);
  }
  if (answerPrev) {
    formData.append('answer_prev', answerPrev);
  }

  const response = await fetch(`${API_BASE}/api/speechtotext`, {
    method: 'POST',
    body: formData,
  });

  const responseText = await response.text();

  if (!response.ok) {
    let message = 'Speech transcription failed';
    try {
      const parsed = JSON.parse(responseText);
      if (parsed?.error) message = parsed.error;
    } catch (_) {}
    throw new Error(message);
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch (error) {
    throw new Error('Invalid transcription response');
  }

  const transcription = typeof data?.speechtotext === 'string' ? data.speechtotext.trim() : '';
  if (!transcription) {
    throw new Error('Transcription missing in response');
  }

  return transcription;
}
