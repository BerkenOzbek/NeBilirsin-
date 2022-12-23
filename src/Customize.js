import { useState, useEffect } from "react"
import { nanoid } from 'nanoid'

export default function Customize({ generateApiUrl, buttonStyle }) {
    const [categoryOptions, setCategoryOptions] = useState([])
    const [difficultyOptions, setDifficultyOptions] = useState([])
    const [apiUrlData, setApiUrlData] = useState({category: "", difficulty: ""})
    const [loading, setLoading] = useState(false)
    const difficulties = ["easy", "medium", "hard"]
    const selectedOption = {
        backgroundColor: "#333333",
        color: "#F5F7FB",
        border: "1px solid #333333"
      }
    
    /* API den katgorileri çeker (kategoriler değişebilir) ve her secenek için boolean değerleri dönemesi için kullanılan kod bloğudur.*/
    useEffect(() => {
        setLoading(true) /* Veri beklerken yükleme ekranını getiren kod bloğudur. */
        fetch("https://opentdb.com/api_category.php")
        .then(res => res.json())
        .then(data => {
            data.trivia_categories.unshift({ id:0, name: "Random", isSelected: true, key: nanoid()})
            /* Gereksiz olan entertaiment ve science kategori adlandırlamalarını silmek için kullanılan kod bloğudur. */
            data.trivia_categories = data.trivia_categories.map(category => {
                let newName = category.name.split('Entertainment: ').join('').split('Science: ').join('')
                return {...category, name: newName}
            })
            setCategoryOptions(data.trivia_categories.map(category => {
                if(category.id !== 0){
                    return {
                        ...category,
                        isSelected: false,
                        key: nanoid()
                        }
                } else { /* random seçeneği için rastgele kategori oluşturur. */
                    return category
                }
            }))
            setDifficultyOptions(difficulties.map(item => ({
                difficulty: item,
                isSelected: false,
                key: nanoid()
            })))
        })
        .catch((err) => {
            console.log(err)
          })
        .finally(() => {
            setLoading(false)
        })
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    /* bu kod bloğu kategori seçebilmemiz için oluşturuldu.API den çektiğimiz kategori isimleri artık birer dizi haline getirldi ve seçenek haline geldi.*/
    function selectCategory(id) {
        setApiUrlData(prevData => ({...prevData, category: id}))
        setCategoryOptions(prevOptions => prevOptions.map(option => {
            let newOption = option
            if(option.isSelected){
                newOption = {...option, isSelected: false}
            }
            if(option.id === id){
                newOption = {...option, isSelected: true}
            }
            return newOption
        }))
    }

    /* bu kod bloğu ise kategori için yapılan kod bloğunun zorluk derecesi için uyarlandı.İşlevi zorşuk seviyesi seçmemizi sağlar. */
    function selectDifficulty(str) {
        setApiUrlData(prevData => ({...prevData, difficulty: str}))
        setDifficultyOptions(prevOptions => prevOptions.map(option => {
            let newOption = option
            if(option.isSelected){
                newOption = {...option, isSelected: false}
            }
            if(option.difficulty === str){
                newOption = {...option, isSelected: true}
            }
            return newOption
        }))
    }

    /* JSX elemanlarını işler ve bunları her bir seçenek için boolean değeri döndürür. */ 
    const categoryElements = categoryOptions.map(category => {
        const styles = category.isSelected ? selectedOption : null
        return <li className="option" onClick={() => selectCategory(category.id)} style={styles} key={category.key}>{category.name}</li>
    })
    const difficultyElements = difficultyOptions.map(item => {
        const styles = item.isSelected ? selectedOption : null
        /* Zorluk dereceleri url den çekilir ve ilk harfi büyük yazılması için yazıldı bu kod bloğu. */
        const formattedItem = item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)
        return <li className="option" onClick={() => selectDifficulty(item.difficulty)} style={styles} key={item.key}>{formattedItem}</li>
    })

    /*loading spinner tekrar gösterilmesi için burda da kullanıldı.*/
    if (loading) {
        return (<div className='app'>
                    <div className='loading-spinner'></div>
                </div>)
    }

    return (
        <div className="customize-container">
            <h3 className="customize-header">Lütfen kategori seçiniz...</h3>
            <ul className='customize-options'>
              {categoryElements}
            </ul>
            <h3 className="customize-header customize-header__difficulty">Zorluk seviyesi seçiniz...</h3>
            <ul className='customize-options customize-options__difficulties'>
              {difficultyElements}
            </ul>
            <button className="baslaButonu" onClick={() => generateApiUrl(apiUrlData)} style={buttonStyle}>Quiz'e Başla...</button>
        </div>
    )
}
