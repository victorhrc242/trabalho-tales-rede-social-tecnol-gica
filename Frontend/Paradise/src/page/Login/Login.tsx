// src/screens/Login.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { FaEnvelope, FaEye, FaEyeSlash } from 'react-icons/fa';
import { FiArrowLeft } from 'react-icons/fi';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [veioDeAdicionarConta, setVeioDeAdicionarConta] = useState(false);

  const navigation = useNavigation();
  const route = useRoute();

  useEffect(() => {
    if (route?.params && (route.params as any).adicionarConta === true) {
      setVeioDeAdicionarConta(true);
    }
  }, [route]);

  const handleLogin = async () => {
    if (!email || !senha) {
      setErro('Preencha todos os campos');
      return;
    }

    setCarregando(true);
    try {
      const response = await fetch(
        'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/login',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, senha }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          // Salvar no AsyncStorage se necessário
          Alert.alert('Login realizado com sucesso!');
          navigation.navigate('Home' as never); // ajuste se usar stack params
        } else {
          setErro('Token não retornado.');
        }
      } else {
        setErro(data.message || 'Erro no login');
      }
    } catch (error) {
      setErro('Usuário ou senha incorretos.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <View style={styles.container}>
      {erro !== '' && (
        <View style={styles.errorToast}>
          <Text style={styles.errorText}>{erro}</Text>
          <TouchableOpacity onPress={() => setErro('')}>
            <Text style={styles.closeButton}>×</Text>
          </TouchableOpacity>
        </View>
      )}

      {veioDeAdicionarConta && (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text>{'< Voltar'}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.form}>
        <Text style={styles.title}>Paradise</Text>

        <TextInput
          style={styles.input}
          placeholder="Digite seu email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.senhaContainer}>
          <TextInput
            style={styles.inputSenha}
            placeholder="Digite sua senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={!mostrarSenha}
          />
          <TouchableOpacity
            onPress={() => setMostrarSenha(!mostrarSenha)}
            style={styles.olhoIcon}
          >
            <Text>{mostrarSenha ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={carregando}
        >
          {carregando ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('RecuperarSenha' as never)}>
          <Text style={styles.link}>Esqueceu a senha?</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('cadastro' as never)}>
          <Text style={styles.link}>
            Não tem uma conta? Cadastrar
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 32,
    color: '#0a66c2',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 2,
    borderColor: '#0a66c2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  senhaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  inputSenha: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#0a66c2',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
  },
  olhoIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  button: {
    backgroundColor: '#0a66c2',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: '#0a66c2',
    textAlign: 'center',
    marginTop: 10,
  },
  errorToast: {
    position: 'absolute',
    top: 40,
    backgroundColor: '#ff4d4f',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  errorText: {
    color: '#fff',
    marginRight: 10,
  },
  closeButton: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
});