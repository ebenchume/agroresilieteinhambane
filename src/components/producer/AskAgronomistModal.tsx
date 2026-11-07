import React, { useState, useRef, useEffect } from 'react';
import { AriaModal } from '../AriaModal';
import { MobileService } from '../../services/mobileService';
import { AgronomistAnswer } from '../../types/mobileApp';
import { 
  MessageSquare, 
  Send, 
  Mic, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2,
  ChevronRight,
  Droplets,
  Bug,
  Calendar
} from 'lucide-react';

interface AskAgronomistModalProps {
  isOpen: boolean;
  onClose: () => void;
  sunlightMode?: boolean;
}

const QUICK_QUESTIONS = [
  {
    icon: Bug,
    title: 'Lagarta no milho',
    question: 'Como combater a lagarta do cartucho no milho usando cinza e remédio caseiro?'
  },
  {
    icon: Droplets,
    title: 'Seca e rega',
    question: 'Como proteger a terra da seca em Panda e Homoíne usando mulching?'
  },
  {
    icon: Calendar,
    title: 'Manivas de mandioca',
    question: 'Qual a melhor forma de guardar ramas de mandioca para plantar na época das chuvas?'
  },
  {
    icon: Sparkles,
    title: 'Poda do cajueiro',
    question: 'Quando e como devo podar o cajueiro para evitar oídio e ter mais castanha?'
  }
];

export const AskAgronomistModal: React.FC<AskAgronomistModalProps> = ({
  isOpen,
  onClose,
  sunlightMode = false
}) => {
  const [question, setQuestion] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('Geral');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<AgronomistAnswer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);

  const stopAudioRef = useRef<(() => void) | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (stopAudioRef.current) stopAudioRef.current();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, []);

  const handleAsk = async (queryText?: string) => {
    const q = (queryText || question).trim();
    if (!q) {
      setError('Por favor escreva ou dite uma pergunta.');
      return;
    }

    setLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const res = await MobileService.askAgronomist(q, selectedCrop, 'Homoíne / Panda, Inhambane');
      setAnswer(res);
    } catch (err: any) {
      setError(err.message || 'Não foi possível contactar o agrónomo. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSpeak = () => {
    if (speaking) {
      if (stopAudioRef.current) stopAudioRef.current();
      setSpeaking(false);
      return;
    }

    if (!answer) return;

    const speechScript = `
      Resposta do Agrónomo: ${answer.answer}.
      Passos práticos: ${answer.practicalSteps.join('. ')}.
      Sabedoria da nossa terra: ${answer.localWisdom}.
    `;

    setSpeaking(true);
    stopAudioRef.current = MobileService.speakText(speechScript, () => {
      setSpeaking(false);
    });
  };

  const handleStartVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('O seu navegador não suporta reconhecimento de voz direto. Por favor escreva a pergunta.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'pt-PT';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setListening(true);
        setError(null);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuestion(transcript);
        setListening(false);
        handleAsk(transcript);
      };

      recognition.onerror = () => {
        setListening(false);
        setError('Não foi possível ouvir com clareza. Tente novamente ou digite.');
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setListening(false);
      setError('Erro ao iniciar o microfone.');
    }
  };

  return (
    <AriaModal
      isOpen={isOpen}
      onClose={onClose}
      title="Perguntar ao Agrónomo"
      maxWidth="max-w-xl"
      className={sunlightMode ? 'bg-black text-white border-4 border-yellow-400' : ''}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              sunlightMode 
                ? 'bg-yellow-400 text-black font-black' 
                : 'bg-emerald-700 text-white shadow-sm'
            }`}>
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${sunlightMode ? 'text-yellow-400' : 'text-stone-900 dark:text-stone-100'}`}>
                Perguntar ao Agrónomo
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Assistência técnica direta para Inhambane · Gemini IA
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 text-xs">
            {error}
          </div>
        )}

        {/* Input box */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">
            O que deseja saber sobre a sua machamba?
          </label>
          <div className="relative">
            <textarea
              rows={3}
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder="Ex: Como posso saber se a terra já tem humidade suficiente para plantar milho?"
              className={`w-full p-3 text-xs rounded-xl border outline-none resize-none ${
                sunlightMode
                  ? 'bg-stone-900 text-white border-stone-600 focus:border-yellow-400'
                  : 'bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 border-stone-300 dark:border-stone-700 focus:border-emerald-600'
              }`}
            />
            <button
              type="button"
              onClick={handleStartVoice}
              className={`absolute right-2.5 bottom-3 p-2 rounded-xl border transition-colors ${
                listening
                  ? 'bg-red-600 text-white animate-pulse'
                  : sunlightMode
                    ? 'bg-yellow-400 text-black border-yellow-400'
                    : 'bg-white dark:bg-stone-800 text-emerald-700 dark:text-emerald-400 border-stone-300 dark:border-stone-700 hover:bg-stone-100'
              }`}
              title="Ditar pergunta por voz"
            >
              <Mic className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => handleAsk()}
            disabled={loading || !question.trim()}
            className={`w-full py-3 px-4 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition-all ${
              sunlightMode
                ? 'bg-yellow-400 hover:bg-yellow-300 text-black font-black'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            } disabled:opacity-50`}
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>O Agrónomo está a pensar...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Enviar Pergunta</span>
              </>
            )}
          </button>
        </div>

        {/* Quick questions pills */}
        {!answer && (
          <div>
            <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mb-2">
              Dúvidas frequentes de outros produtores de Inhambane:
            </p>
            <div className="space-y-1.5">
              {QUICK_QUESTIONS.map((q, idx) => {
                const IconComponent = q.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setQuestion(q.question);
                      handleAsk(q.question);
                    }}
                    className={`w-full p-2.5 text-left rounded-xl border flex items-center justify-between gap-2 text-xs transition-colors ${
                      sunlightMode
                        ? 'bg-stone-900 border-stone-700 text-stone-200 hover:border-yellow-400'
                        : 'bg-white dark:bg-stone-900/60 border-stone-200 dark:border-stone-800 hover:border-emerald-500 text-stone-800 dark:text-stone-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span className="font-semibold">{q.title}:</span>
                      <span className="truncate max-w-[240px] text-stone-500 dark:text-stone-400">{q.question}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Answer section */}
        {answer && (
          <div className="space-y-3 pt-2 max-h-[60vh] overflow-y-auto pr-1">
            {/* Audio Button */}
            <div className={`p-2.5 rounded-xl flex items-center justify-between border ${
              sunlightMode
                ? 'bg-yellow-400 text-black border-yellow-400 font-bold'
                : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
            }`}>
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-800 dark:text-emerald-300" />
                <span className="text-xs font-bold">Ouvir explicação em voz alta</span>
              </div>
              <button
                type="button"
                onClick={handleToggleSpeak}
                className={`px-3 py-1 rounded-lg text-xs font-bold ${
                  speaking ? 'bg-red-600 text-white' : 'bg-emerald-700 text-white'
                }`}
              >
                {speaking ? 'Parar' : 'Ouvir'}
              </button>
            </div>

            {/* Answer body */}
            <div className="p-4 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-sm space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Resposta do Agrónomo:
              </h4>
              <p className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed font-medium">
                {answer.answer}
              </p>

              <div>
                <h5 className="text-[11px] font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Passos Práticos Recomendados:</span>
                </h5>
                <ul className="space-y-1">
                  {answer.practicalSteps.map((step, i) => (
                    <li key={i} className="text-xs text-stone-700 dark:text-stone-300 flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 text-xs italic">
                "{answer.localWisdom}"
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setAnswer(null);
                setQuestion('');
              }}
              className="w-full py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              Fazer outra pergunta
            </button>
          </div>
        )}
      </div>
    </AriaModal>
  );
};
