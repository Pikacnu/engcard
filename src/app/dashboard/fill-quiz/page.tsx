'use client';

import { useState, FormEvent, useEffect } from 'react'; // Added useEffect
import { FillInTheBlankQuestion } from '@/type'; // Import the type
import { useTranslation } from '@/context/LanguageContext'; // For i18n
import Joyride, {
	Step,
	CallBackProps,
	ACTIONS,
	STATUS,
	Status,
} from 'react-joyride';
import { useLocalStorage } from '@/hooks/localstorage';

export default function FillQuizPage() {
    const { t } = useTranslation();
    const [sourceWords, setSourceWords] = useState<string>(''); // Input for comma-separated words
    const [generatedQuestions, setGeneratedQuestions] = useState<FillInTheBlankQuestion[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // States to store fetched questions for the user
    const [userQuestions, setUserQuestions] = useState<FillInTheBlankQuestion[]>([]);
    const [isLoadingUserQuestions, setIsLoadingUserQuestions] = useState<boolean>(false);

    // Function to fetch user's existing questions (to be called in useEffect)
    const fetchUserQuestions = async () => {
        setIsLoadingUserQuestions(true);
        try {
            const response = await fetch('/api/questions/fill-in-the-blank');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch user questions');
            }
            const data = await response.json();
            setUserQuestions(data.questions || []);
        } catch (err: any) {
            console.error(err);
            // Optionally set an error state for displaying user questions error
        } finally {
            setIsLoadingUserQuestions(false);
        }
    };

    // useEffect to load user questions on component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        fetchUserQuestions();
    }, []); // Empty dependency array to run once on mount

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!sourceWords.trim()) {
            setError(t('dashboard.fillQuiz.errorNoWords')); // Example translation key
            return;
        }
        setIsLoading(true);
        setError(null);
        setGeneratedQuestions([]); // Clear previous results

        try {
            const wordsArray = sourceWords.split(',').map(word => word.trim()).filter(word => word);
            if (wordsArray.length === 0) {
                setError(t('dashboard.fillQuiz.errorNoValidWords'));
                setIsLoading(false);
                return;
            }

            const response = await fetch('/api/questions/fill-in-the-blank', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ words: wordsArray }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate questions');
            }

            const data = await response.json();
            setGeneratedQuestions(data.questions || []);
            // After successfully generating new questions, refresh the list of user questions
            fetchUserQuestions(); 

        } catch (err: any) {
            setError(err.message || t('dashboard.fillQuiz.errorGenerationFailed'));
        } finally {
            setIsLoading(false);
        }
    };

    const [guideFillQuizPage, setGuideFillQuizPage] = useLocalStorage(
        'guideFillQuizPage',
        false,
    );
    const [joyrideRun, setJoyrideRun] = useState(!guideFillQuizPage);

    const steps: Array<Step> = [
        {
            target: 'body', // Or a more specific selector for the main page area if available
            content: t('dashboard.fillQuiz.joyride.step1Intro'),
            disableBeacon: true,
            placement: 'center',
        },
        {
            target: '.joyride-fill-quiz-form-area',
            content: t('dashboard.fillQuiz.joyride.step2FormArea'),
        },
        {
            target: '.joyride-fill-quiz-input-words',
            content: t('dashboard.fillQuiz.joyride.step3InputWords'),
        },
        {
            target: '.joyride-fill-quiz-generate-button',
            content: t('dashboard.fillQuiz.joyride.step4GenerateButton'),
        },
        {
            target: '.joyride-fill-quiz-generated-area',
            content: t('dashboard.fillQuiz.joyride.step5GeneratedArea'),
        },
        {
            target: '.joyride-fill-quiz-user-questions-area',
            content: t('dashboard.fillQuiz.joyride.step6UserQuestionsArea'),
        },
    ];

    const handleJoyrideCallback = (data: CallBackProps) => {
        const { status, type } = data;
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as Status)) {
            setJoyrideRun(false);
            setGuideFillQuizPage(true); // Mark tour as seen
        }
        console.log('Joyride FillQuiz Page Callback:', data);
    };

    return (
        <div className="p-4 md:p-8 space-y-6 dark:bg-gray-800 text-gray-900 dark:text-white min-h-screen">
            <Joyride
				steps={steps}
				run={joyrideRun}
				callback={handleJoyrideCallback}
				continuous
				showProgress
				showSkipButton
				styles={{
					options: {
						zIndex: 10000,
						primaryColor: '#007bff', 
					},
				}}
			/>
            <h1 className="text-2xl md:text-3xl font-bold text-center">
                {t('dashboard.fillQuiz.title')} {/* Example translation key */}
            </h1>

            {/* Form for inputting words */}
            <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md space-y-4 joyride-fill-quiz-form-area">
                <div>
                    <label htmlFor="sourceWords" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('dashboard.fillQuiz.labelSourceWords')} {/* e.g., "Enter words (comma-separated):" */}
                    </label>
                    <textarea
                        id="sourceWords"
                        value={sourceWords}
                        onChange={(e) => setSourceWords(e.target.value)}
                        placeholder={t('dashboard.fillQuiz.placeholderSourceWords')} {/* e.g., "e.g., happy, technology, ubiquitous" */}
                        rows={3}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 dark:text-white joyride-fill-quiz-input-words"
                    />
                </div>
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 dark:disabled:bg-gray-500 joyride-fill-quiz-generate-button"
                >
                    {isLoading ? t('dashboard.fillQuiz.buttonLoading') : t('dashboard.fillQuiz.buttonGenerate')} {/* e.g., "Generating..." / "Generate Questions" */}
                </button>
                {error && <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>}
            </form>

            {/* Display Area for Newly Generated Questions */}
            {generatedQuestions.length > 0 && (
                <div className="mt-6 max-w-2xl mx-auto joyride-fill-quiz-generated-area">
                    <h2 className="text-xl font-semibold mb-3 text-center">{t('dashboard.fillQuiz.headerGenerated')}</h2>
                    <div className="space-y-4">
                        {generatedQuestions.map((q, index) => (
                            <div key={index} className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.fillQuiz.labelSourceWordDisplay', { word: q.sourceWord })}</p>
                                <p className="mt-1">
                                    {q.blankedSentence ? (
                                        q.blankedSentence.split('____').map((part, partIndex, arr) => (
                                            <span key={partIndex}>
                                                {part}
                                                {partIndex < arr.length - 1 && (
                                                    <strong className="text-blue-500 dark:text-blue-400 font-semibold">____</strong>
                                                )}
                                            </span>
                                        ))
                                    ) : ''}
                                </p>
                                <p className="mt-1 text-sm font-medium text-green-600 dark:text-green-400">{t('dashboard.fillQuiz.labelCorrectAnswer', { answer: q.correctWord })}</p>
                                {q.options && q.options.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.fillQuiz.labelOptions')}</p>
                                        <ul className="list-disc list-inside pl-4">
                                            {q.options.map((opt, i) => <li key={i} className="text-xs">{opt}</li>)}
                                        </ul>
                                    </div>
                                )}
                                {q.difficulty && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">{t('dashboard.fillQuiz.labelDifficulty', { difficulty: q.difficulty })}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Display Area for User's Existing Questions */}
            <div className="mt-10 max-w-3xl mx-auto joyride-fill-quiz-user-questions-area">
                <h2 className="text-xl md:text-2xl font-semibold mb-4 text-center">
                    {t('dashboard.fillQuiz.headerYourQuestions')} {/* e.g., "Your Saved Questions" */}
                </h2>
                {isLoadingUserQuestions && <p className="text-center">{t('dashboard.fillQuiz.loadingUserQuestions')}</p>}
                {!isLoadingUserQuestions && userQuestions.length === 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400">{t('dashboard.fillQuiz.noUserQuestions')}</p>
                )}
                {userQuestions.length > 0 && (
                    <div className="space-y-4">
                        {userQuestions.map((q) => (
                            <div key={q._id} className="p-4 bg-white dark:bg-gray-700 rounded-lg shadow">
                                <p className="text-sm text-gray-500 dark:text-gray-400">{t('dashboard.fillQuiz.labelSourceWordDisplay', { word: q.sourceWord })}</p>
                                <p className="mt-1">
                                    {q.blankedSentence ? (
                                        q.blankedSentence.split('____').map((part, partIndex, arr) => (
                                            <span key={partIndex}>
                                                {part}
                                                {partIndex < arr.length - 1 && (
                                                    <strong className="text-blue-500 dark:text-blue-400 font-semibold">____</strong>
                                                )}
                                            </span>
                                        ))
                                    ) : (
                                        '' 
                                    )}
                                </p>
                                <details className="text-sm mt-1">
                                    <summary className="cursor-pointer text-indigo-600 dark:text-indigo-400 hover:underline">{t('dashboard.fillQuiz.showAnswer')}</summary>
                                    <p className="mt-1 font-medium text-green-600 dark:text-green-400">{q.correctWord}</p>
                                    {q.options && q.options.length > 0 && (
                                        <div className="mt-1">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{t('dashboard.fillQuiz.labelOptions')}</p>
                                            <ul className="list-disc list-inside pl-4">
                                                {q.options.map((opt, i) => <li key={i} className="text-xs">{opt}</li>)}
                                            </ul>
                                        </div>
                                    )}
                                </details>
                                {q.difficulty && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">{t('dashboard.fillQuiz.labelDifficulty', { difficulty: q.difficulty })}</p>}
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{t('dashboard.fillQuiz.labelCreatedAt', { date: new Date(q.createdAt!).toLocaleDateString() })}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
