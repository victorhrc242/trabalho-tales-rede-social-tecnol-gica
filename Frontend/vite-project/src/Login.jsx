import React from 'react'
import './login.css'

function Login  ()  {
//      const [email, setEmail] = useState("");
//    const [password, setPassword] = useState("");


//    const handleSubmit = (e) => {
//      e.preventDefault();
//      console.log("Email:", email, "Senha:", password);
//      alert("Login realizado com sucesso!");
//    };

  return (

    <div className='login-container'>

        <h2>login</h2>

        <form >

        <input type="email" placeholder='digite seu email'  />    

        </form>

        <form >

        <input type="senha" placeholder='digite sua senha' />

        </form>    

        <button type="submit">Entrar</button>

    
    </div>


   
  )
}

export default Login