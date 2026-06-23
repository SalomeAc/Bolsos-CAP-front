import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

export const recognizeSpeech = () =>
  new Promise((resolve, reject) => {
    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(
      import.meta.env.VITE_AZURE_KEY,
      import.meta.env.VITE_AZURE_REGION,
    );

    speechConfig.speechRecognitionLanguage = "es-CO";

    const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

    const recognizer = new SpeechSDK.SpeechRecognizer(
      speechConfig,
      audioConfig,
    );

    recognizer.recognizeOnceAsync((result) => {
      console.log(result);
      console.log("Reason:", result.reason);
      console.log("Text:", result.text);

      if (result.text) {
        setSearchTerm(result.text);
      }
    });
  });
