import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import service from './service/service';

function App() {
  const [maxSecond, setMaxSecond] = useState(5);
  const [second, setSecond] = useState(5);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isTestEnded, setIsTestEnded] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [{trues, falses, empty}, setResult] = useState({trues: 0, falses: 0, empty: 0})
  function handleSecond(second = 10) {
    setSecond(second);
    setMaxSecond(second);
  }

  const goNextQuestion = () => {
    setQuestionIndex(prevQuestionIndex => {
      handleSecond(30);
      return prevQuestionIndex + 1;
    });
  };

  const updateQuestions = async () => {
    const response = await service.getQuestions();
    const currentQuestions = response.filter((data) => data.userId === 1)
    currentQuestions.map((question) => {
      const answers = [];
      for(let i = 0; i < 4; i++) {
        let answer = question.body.split(' ')[Math.round(Math.random() * (question.body.split(' ').length - 1))];
        while (answers.includes(answer)) {
          answer = question.body.split(' ')[Math.round(Math.random() * (question.body.split(' ').length - 1))];
        }
        if(!answers.includes(answer)) {
          answers.push(answer);
        }
      }
      question.answers = answers;
      question.correctAnswer = Math.round((answers.length - 1) * Math.random());
    })
    setQuestions(currentQuestions);
  }

  useEffect(() => {
    document.title = 'Quiz App | Baykar Test'
    handleSecond(30);
    updateQuestions();
  }, []);

  useEffect(() => {
    if(second === 0 && questionIndex !== 9) {
      setTimeout(() => {
        setAnswers(prevAnswers => [...prevAnswers, selectedAnswer]);
        setSelectedAnswer(null);
        goNextQuestion();
      }, 1000)
    }else if (second === 0 && questionIndex === 9) {
      var trues = 0;
      var falses = 0;
      var empty = 0;
      setAnswers(prevAnswers => [...prevAnswers, selectedAnswer]);
      setIsTestEnded(true);
      questions.map((question, index) => {
        if(question.correctAnswer === answers[index]){
          trues++;
        } else if(question.correctAnswer !== answers[index] && answers[index] !== null) {
          falses++;
        }else if(answers[index] === null){
          empty++;
        }
      });
      setResult({
        trues,
        falses,
        empty
      });
    }
  }, [second])

  useEffect(() => {
    if(!isTestEnded) {
      const interval = setInterval(() => {
        setSecond(prevSecond =>  prevSecond - 1)
      }, 1000);
      return () => clearInterval(interval);
    }
  },[questionIndex, isTestEnded])

  return (
    <div 
      style={{
        height: '100dvh',
        width: '100dvw',
        backgroundImage: 'radial-gradient( circle 1224px at 10.6% 8.8%,  rgba(255,255,255,1) 0%, rgba(153,202,251,1) 100.2% )'
      }}
    >
      <div 
        className='position-absolute bg-white rounded-3 overflow-hidden card-main'
        style={{
          height: '50vh',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          boxShadow: '0px 25px 50px -12px rgba(0,0,0,0.25), 0px 0px 15px 0px rgba(0,0,0,0.07)'
        }}
      >
        <div
          className='text-white d-flex justify-content-center rounded-top-3 align-items-center flex-column position-relative overflow-hidden'
        >
          <div className='position-absolute top-0' style={{
            background: maxSecond - second < 10 ? '#FBDD70' : '#9cc6ff',
            transition: 'all 1s linear',
            left: '0%',
            height: '24px',
            width: `${(maxSecond - second) / maxSecond * 100}%`
          }}></div>
          <span style={{mixBlendMode: 'difference'}}>{isTestEnded ? `${trues} Doğru - ${falses} Yanlış - ${empty} Boş` : second+'sn'}</span>
        </div>
        <div 
          className='p-4 d-flex flex-column justify-content-between'
          style={{
            height: "calc(100% - 24px)",
          }}
        >
          {
            !isTestEnded && (
              <>
                <div className='text-black'>
                  <h4>{questionIndex + 1}. Soru</h4>
                  <p>{questions[questionIndex]?.body}</p>
                </div>
                <div className='row w-100' style={{
                  "--bs-gutter-x": 0
                }}>
                  {
                    questions[questionIndex]?.answers.map((answer, index) => (
                      <div 
                        key={'questionIndex_' + index}
                        className='col-sm-6 p-2'>
                        <button 
                          key={index}
                          className='p-2'
                          style={{
                            display: 'flex',
                            cursor: 'pointer',
                            transition: 'all 100ms linear',
                            background: selectedAnswer === index ? '#9cc6ff' : '#f8f9fa',
                            border: '1px solid #dee2e6',
                            borderRadius: '5px',
                            width: '100%',
                          }}
                          disabled={maxSecond - second < 10}
                          onClick={() => {
                            if(selectedAnswer === index) {
                              setSelectedAnswer(null);
                            } else {
                              setSelectedAnswer(index);
                            }
                          }}
                        >
                          {index === 0 ? 'A.' : index === 1 ? "B." : index === 2 ? "C." : index === 3 ? "D." : null} {answer}
                        </button>
                      </div>
                    ))
                  }
                </div>
              </>
            )
          }
          {
            isTestEnded && (
              <div className='w-100 overflow-auto px-2 h-100'>
                {
                  questions.map((question, index) => {
                    return (
                      <div
                        key={'result_' + index}
                      >
                        <p>{index + 1}. Soru</p>
                        <p>{question.body}</p>
                        <div>
                            {
                              question.answers.map((answer, index2) => {
                                return (
                                  <button 
                                    key={index2}
                                    className='p-2 mb-3'
                                    style={{
                                      display: 'flex',
                                      cursor: 'pointer',
                                      transition: 'all 100ms linear',
                                      background: index2 === answers[index] ? question.correctAnswer === answers[index] ? '#9CFFBD' : '#FDDEE0' : '#f8f9fa',
                                      border: index2 === answers[index] ? question.correctAnswer === answers[index] ? '1px solid #73F9A0' : '1px solid #FFA9AF' : '1px solid #dee2e6',
                                      borderRadius: '5px',
                                      width: '100%', 
                                    }}
                                    disabled={true}
                                  >
                                    {index2 === 0 ? 'A.' : index2 === 1 ? "B." : index2 === 2 ? "C." : index2 === 3 ? "D." : null} {answer}
                                  </button>
                                )
                              })
                            }
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}

export default App;
