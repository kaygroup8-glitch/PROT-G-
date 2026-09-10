import { AssemblyAI } from 'assemblyai';
import { GoogleGenAI, Modality } from '@google/genai';

let assemblyAiClient: AssemblyAI | null = null;
function getAssemblyAIClient(): AssemblyAI | null {
  const key = process.env.ASSEMBLYAI_API_KEY?.trim();
  if (!key) return null;
  if (!assemblyAiClient) {
    assemblyAiClient = new AssemblyAI({ apiKey: key });
  }
  return assemblyAiClient;
}

let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey: key });
  }
  return geminiClient;
}

/**
 * Server-side Voice Service with AssemblyAI as the exclusive speech recognition engine.
 * Dedicated AssemblyAI: never falls back to any secondary provider or service.
 */
export async function transcribeWithAssemblyAI(
  audioBuffer: Buffer,
  _mimeType: string = 'audio/webm'
): Promise<{ transcript: string; provider: string; error?: string }> {
  const client = getAssemblyAIClient();

  if (!client) {
    throw new Error('ASSEMBLYAI_API_KEY is not configured on the server. AssemblyAI is required for voice transcription.');
  }

  // Pure, direct AssemblyAI speech transcription (Universal-2 speech model)
  const response = await client.transcripts.transcribe({
    audio: audioBuffer,
    punctuate: true,
    format_text: true,
    speech_model: 'best',
  });

  if (response.status === 'completed') {
    return {
      transcript: (response.text || '').trim(),
      provider: 'AssemblyAI',
    };
  }

  if (response.status === 'error') {
    throw new Error(response.error || 'AssemblyAI speech recognition error');
  }

  throw new Error(`AssemblyAI transcript did not complete (status: ${response.status})`);
}

/**
 * Helper: Convert Raw PCM 24kHz Mono to standard WAV Buffer
 */
function pcmToWav(pcmBuffer: Buffer, sampleRate = 24000, numChannels = 1): Buffer {
  const byteRate = sampleRate * numChannels * 2;
  const blockAlign = numChannels * 2;
  const wavBuffer = Buffer.alloc(44 + pcmBuffer.length);

  wavBuffer.write('RIFF', 0);
  wavBuffer.writeUInt32LE(36 + pcmBuffer.length, 4);
  wavBuffer.write('WAVE', 8);
  wavBuffer.write('fmt ', 12);
  wavBuffer.writeUInt32LE(16, 16); // Subchunk1Size (16 for PCM)
  wavBuffer.writeUInt16LE(1, 20); // AudioFormat (1 for PCM)
  wavBuffer.writeUInt16LE(numChannels, 22);
  wavBuffer.writeUInt32LE(sampleRate, 24);
  wavBuffer.writeUInt32LE(byteRate, 28);
  wavBuffer.writeUInt16LE(blockAlign, 32);
  wavBuffer.writeUInt16LE(16, 34); // BitsPerSample
  wavBuffer.write('data', 36);
  wavBuffer.writeUInt32LE(pcmBuffer.length, 40);
  pcmBuffer.copy(wavBuffer, 44);

  return wavBuffer;
}

/**
 * Generate Hyper-Realistic Neural Voice Speech (WAV audio)
 * Replacing robotic Web Speech Synthesis with natural, human-like voice.
 */
export async function generateNeuralSpeech(
  text: string,
  voiceName: string = 'Kore'
): Promise<Buffer> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY is required to generate neural speech.');
  }

  const prompt = `Say in a calm, friendly, warm tone of a curious student: ${text}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-tts-preview',
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: voiceName || 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error('Neural speech model did not return audio data.');
  }

  const pcmBuffer = Buffer.from(base64Audio, 'base64');
  return pcmToWav(pcmBuffer, 24000, 1);
}

