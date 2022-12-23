import { useState, useEffect } from 'react';
import Intro from './Intro'
import Customize from './Customize';
import { nanoid } from 'nanoid'
import { decode } from 'html-entities'

function App() {
  const [quiz_sorulari, quiz_sorulari_kur] = useState([])
  const [secilen_cevaplar, secilen_cevaplar_kur] = useState([])
  const [ilk_deger, ilk_değer_kur] = useState(true)
  const [ozellestir_quiz, ozellestir_quiz_kur] = useState(false)
  const [bitti_quiz, bitti_quiz_kur] = useState(false)
  const [numCorrect, setNumCorrect] = useState(0)
  const [apiUrl, setApiUrl] = useState("")
  const [yukleniyor, setLoading] = useState(false)
  const [buton_stili, setButtonStyle] = useState({})

/* Bu kod satırları başlangıç bileşenine aktarıldı, başlat düğmesine basıldığında quiz ekranının gelmesi sağlanıyor. Sadece başlangıçta kullanıldı. */  
function baslaSorulara() {
    ilk_değer_kur(false)
    ozellestir_quiz_kur(true)
  }

/* Html kodlarını gerekli karakterlere dönüştürmesi için kullanlan kod bloğu. */
function formatData(data) {
    return decode(data)
  }

/* API den bilgi çekmek için url oluşturdum ardından veri çekme işlemi yaptım React.Js ile.*/
function generateApiUrl(data){
    if(data.difficulty){
      let url = `https://opentdb.com/api.php?amount=5&category=${data.category}&difficulty=${data.difficulty}`
      setApiUrl(url)
      setButtonStyle({})
      ozellestir_quiz_kur(false)
    } else {
      setButtonStyle({ /* Bu fonksiyon başlat butonuna basmadan üzerine geldiğimizdeki similasyonu yapar. */
        animation: "wiggle 500ms"
      })
      setTimeout(() => setButtonStyle({}), 500)
    }
  }

  useEffect(() => {
    setLoading(true) /* Veriler yüklenene kadar yukleniyor spinner ekledim. */
    fetch(apiUrl)
      .then(res => res.json())
      .then(data => {
        const formattedData = data.results.map(item => {
          const formattedCorrectAnswer = formatData(item.correct_answer)
          const incorrect = item.incorrect_answers.map(answer => formatData(answer))
          let answerOptionsArr = []
          for(let i of incorrect){
              answerOptionsArr.push(i)
          }
           /* Rastgele indeksteki cevap seçeneklerine doğru cevabı ekle kodunu çalıştırır bu kod bloğu. */
          const randomNum = Math.floor(Math.random() * 4)
          answerOptionsArr.splice(randomNum, 0, formattedCorrectAnswer)
          /*API den çektiğim soruları bize random seçeneği seçilirse random seçmesi sağlanılır ve her soru için ayrı id oluşturulup doğru ve yanlış cevaplar ayırt edilir. */
          return {
            id: nanoid(),
            question: formatData(item.question),
            correct_answer: formattedCorrectAnswer,
            answerOptions: answerOptionsArr.map(answer => (
              {
                answer: answer,
                isSelected: false,
                isCorrect: false,
                isIncorrect: false,
                id: nanoid()
              }
            ))
          }
        })
        quiz_sorulari_kur(formattedData)
      })
      .catch(err => console.log(err))
      .finally(() => setLoading(false))
  }, [apiUrl]) /* Bu kod bloğu eğer sayfa yenilenirse API den yeni sorular çekmesini sağlayan kod bloğudur. */

  /* Bu kod bloğu her yanıt için seçme işlemi yapar yani seçeneklerin seçilmesi sağlanılır. */
  function selectAnswer(id, num, answer) {
    if(!bitti_quiz) {
      /*Eğer testi yeniden denemek isterse kullanıcı aynı cevaplar gösterilmemesi için kullanılan kod bloğudur.*/
      secilen_cevaplar_kur(prevAnswers => { 
        for(let i of prevAnswers){
          if(i.questionIndex === num){
            return prevAnswers.map(item => {
              return item.questionIndex === num ?
                    {...item, answer: answer} :
                    item
            })
          }
        }
        return [...prevAnswers, { answer: answer, questionIndex: num }]
      })
      /* API den çekilen soruların cevaplarını kontrol etmek için kullanılan kod bloğudur direkt olarak quizSorular fonksiyonunu etkilemektedir.*/
      quiz_sorulari_kur(prevQuestions => prevQuestions.map((question, index) => { 
        if(index === num){
          const newAnswerOptions = question.answerOptions.map(option => {
            let newOption = option
            if(option.isSelected){
              newOption = {...option, isSelected: false}
            }
            if(option.id === id){
              newOption = {...option, isSelected: true}
            }
            return newOption
          })
          return {...question, answerOptions: newAnswerOptions}
        } else return question
      }))
    }
  }

  /* Eğer kullanıcı tüm sorulara cevap verirse sonuçları görebilse için yapılan kod bloğudur eğer kullanıcı 5 ten az cevap girerse sonuçları göremez. */
  function checkAnswers() {
    if(secilen_cevaplar.length === 5){
      for(let i of secilen_cevaplar){
        if(i.answer === quiz_sorulari[i.questionIndex].correct_answer) {
          setNumCorrect(prev => prev + 1)
        }
 
      }
      /* JSX öğeleri oluşturulduğunda uygulanan biçimlendirme koşullarına göre doğru ve yanlış değerleri vurgulayacak olan boolean değerlerini değiştirmek için quizSoruları fonksiyonunu doğrudan etkiler ve cevaplar vurgulanır.
*/
      quiz_sorulari_kur(prevQuestions => prevQuestions.map((question, index) => {
        const newAnswerOptions = question.answerOptions.map(option => {
          let newOption = option
          if(option.answer === question.correct_answer){
            newOption = {...option, isCorrect: true}
          }
          if(option.isSelected && option.answer !== question.correct_answer){
            newOption = {...option, isIncorrect: true}
          }
          return newOption
        })
        return {...question, answerOptions: newAnswerOptions}
      }))
      setButtonStyle({})
      bitti_quiz_kur(true)
    } else {
      setButtonStyle({ /* kontrol etme butonu için oluşturulan kod bloğudur. */
        animation: "wiggle 500ms"
      })
      setTimeout(() => setButtonStyle({}), 500)
    }
  }

  /* Yeniden oyna tuşuna basıldığı gibi başlangiç sayfasını geçerek direkt kategori alanına yönlendirilmesi için oluşturulan kod bloğudur. */
  function playAgain() {
    secilen_cevaplar_kur([])
    setNumCorrect(0)
    bitti_quiz_kur(false)
    setApiUrl({})
    ozellestir_quiz_kur(true)
  }

  /* JSX değerlerini işlemesi için oluşturulmuştur.Boolenları kontrol eder.*/
  const questionElements = quiz_sorulari.map((quizQuestion, questionIndex) => {
    const answerOptionElements = quizQuestion.answerOptions.map(option => {
      let styles
      if(option.isSelected){
        styles = {
          backgroundColor: "#333333",
          color: "#F5F7FB",
          border: "1px solid #333333"
        }
      }
      if(option.isCorrect){
        styles = {
          backgroundColor: "#7ee695",
          border: "1px solid #7ee695"
        }
      }
      if(option.isIncorrect){
        styles = {
          backgroundColor: "#fa8e8e",
          color: "#545e94",
          border: "1px solid #fa8e8e"
        }
      }
      if(bitti_quiz && !option.isCorrect &&!option.isIncorrect){
        styles = {
          color: "#8f96bd",
          border: "1px solid #8f96bd"
        }
      }
      return (<li 
                className='option' style={styles} onClick={() => selectAnswer(option.id, questionIndex, option.answer)} key={option.id}
              >
                {option.answer}
              </li>)
    })
    return (
      <div className='quizSoruları' key={quizQuestion.id}>
          <h3 className='quizSoruları_sorular'>{quizQuestion.question}</h3>
          <ul className='quizSoru'>
              {answerOptionElements}
          </ul>
      </div>
    )
  })

  /* Bu kod bloğu yukleniyor spinner dir işlevi veri beklerken yada başka bir sayfaya geçerken gosterilen yükleme animasyon için kullanılan kod bloğudur. */
  if (yukleniyor) {
    return (<div className='app'>
              <div class="lds-hourglass"></div>
            </div>)
  }

  return (

    <div className="app">
      {ilk_deger ?
      <Intro baslaSorulara={baslaSorulara} /> :
      ozellestir_quiz && <Customize generateApiUrl={generateApiUrl} buton_stili={buton_stili}/>}
      {!ilk_deger && !ozellestir_quiz &&
      <div className='quizIceriği'>
        {questionElements}
        {!bitti_quiz ? 
        <button className='kontrolButonu' onClick={checkAnswers} style={buton_stili}>Sonuçları Gör...</button> :
        <div className='quizBitisIceriği'>
          <p className='skor'>5 cevaptaki başarı skorun %{numCorrect*20}</p>
          <button className='tekrarOynaButonu' onClick={playAgain}>Tekrar Oyna...</button>
        </div>}
      </div>}
    </div>
    
  )
}

export default App;
