import { recognizeSpeech } from "../../services/speechService";

export default function VoiceButton({ onResult }) {
  const handleClick = async () => {
    try {
      const text = await recognizeSpeech();
      onResult(text);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button
      className="voice-search-button"
      type="button"
      onClick={handleClick}
    >
      <span className="iconamoon--microphone-bold"></span>
    </button>
  );
}