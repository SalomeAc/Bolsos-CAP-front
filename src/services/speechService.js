import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

export const recognizeSpeech = () =>
  new Promise((resolve, reject) => {
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      import.meta.env.VITE_AZURE_KEY,
      import.meta.env.VITE_AZURE_REGION,
    );

    speechConfig.speechRecognitionLanguage = "es-CO";

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizeOnceAsync((result) => {
      recognizer.close();

      if (result.text) {
        resolve(result.text);
      } else {
        reject(new Error("No se detectó voz. Intenta de nuevo."));
      }
    }, (error) => {
      recognizer.close();
      reject(new Error(error));
    });
  });