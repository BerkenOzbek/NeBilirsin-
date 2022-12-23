import React from "react"
//Burda fonksiyon oluşturup tek tek implementasyon için nesne oluşturdum ve overload edeceğim için tek fonksiyonda kullanmak istedim.
export default function baslangic_sayfasi({ baslaSorulara }) {
    return (
        <div className="baslangıc">
            <h1 className="baslangıcBaslıgı">Ne Biliyorsun?</h1>
            <p className="baslangıcAltBaslıgı">Soruları Bil,
        Büyük ödülün sahibi ol...</p>
            <button className="baslaButonu" onClick={baslaSorulara} >Başla</button>
        </div>
    )
}