import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createClient } from '@supabase/supabase-js';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import * as ImagePicker from 'expo-image-picker';

// Supabase config
const supabase = createClient(
  'https://vffnyarjcfuagqsgovkd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZm55YXJqY2Z1YWdxc2dvdmtkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzUyNjE0NywiZXhwIjoyMDU5MTAyMTQ3fQ.CvLdiGKqykKGTsPzdw7PyiB6POS-bEJTuo6sPE4fUKg'
);

const Cadastro = () => {
  const navigation = useNavigation();

  const [etapa, setEtapa] = useState(1);
  const [nome, setNome] = useState('');
  const [nome_usuario, setNome_usuario] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [repetirSenha, setRepetirSenha] = useState('');
  const [fotoPerfilUri, setFotoPerfilUri] = useState(null);
  const [biografia, setBiografia] = useState('');
  const [dataAniversario, setDataAniversario] = useState('');
  const [codigoVerificacao, setCodigoVerificacao] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [erro, setErro] = useState('');

  // Mostrar/ocultar senha
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarRepetirSenha, setMostrarRepetirSenha] = useState(false);

  // Loading states
  const [loadingProximaEtapa, setLoadingProximaEtapa] = useState(false);
  const [loadingVerificarCodigo, setLoadingVerificarCodigo] = useState(false);
  const [loadingCadastro, setLoadingCadastro] = useState(false);

  // Modal sucesso
  const [showModalSucesso, setShowModalSucesso] = useState(false);

  // Função para pegar permissão e escolher foto
  const escolherFoto = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão necessária', 'Precisamos de permissão para acessar suas fotos.');
        return;
      }
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.cancelled) {
      setFotoPerfilUri(result.uri);
    }
  };

  // Upload da imagem para supabase storage
  const uploadImagem = async (uri) => {
    try {
      // Buscar arquivo local em formato blob para upload
      const response = await fetch(uri);
      const blob = await response.blob();

      const fileName = `${Date.now()}_perfil.jpg`;
      const { data, error } = await supabase.storage
        .from('imagens-usuarios')
        .upload(`perfil/${fileName}`, blob);

      if (error) {
        console.error('Erro no upload:', error);
        throw error;
      }

      const urlPublica = `https://vffnyarjcfuagqsgovkd.supabase.co/storage/v1/object/public/imagens-usuarios/perfil/${fileName}`;
      return urlPublica;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  // Validação de senha
  const validarSenhaSegura = (senha) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
    return regex.test(senha);
  };

  // Etapa 1: enviar código
  const handleProximaEtapa = async () => {
    setErro('');
    setMensagem('');
    setLoadingProximaEtapa(true);

    if (!validarSenhaSegura(senha)) {
      setErro(
        'A senha deve ter pelo menos 6 caracteres, uma letra maiúscula, um número e um caractere especial.'
      );
      setLoadingProximaEtapa(false);
      return;
    }

    if (senha !== repetirSenha) {
      setErro('As senhas não coincidem.');
      setLoadingProximaEtapa(false);
      return;
    }

    if (!email) {
      setMensagem('Informe seu e-mail para receber o código de cadastro.');
      setLoadingProximaEtapa(false);
      return;
    }

    try {
      const response = await fetch(
        'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/Enviar-codigo',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ Email: email, Tipo: 'cadastro' }),
        }
      );
      if (response.ok) {
        setMensagem('Código enviado para seu e-mail.');
        setEtapa(2);
      } else {
        const data = await response.json();
        setMensagem(data?.message || 'Erro ao enviar código.');
      }
    } catch (error) {
      setMensagem('Erro ao conectar com o servidor.');
    } finally {
      setLoadingProximaEtapa(false);
    }
  };

  // Etapa 2: verificar código
  const handleVerificarCodigo = async () => {
    setErro('');
    setMensagem('');
    setLoadingVerificarCodigo(true);

    if (!codigoVerificacao || codigoVerificacao.trim().length === 0) {
      setMensagem('Informe o código de verificação.');
      setLoadingVerificarCodigo(false);
      return;
    }

    try {
      const response = await fetch(
        'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/Verificar-codigo',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            Email: email,
            Codigo: codigoVerificacao,
            Tipo: 'cadastro',
          }),
        }
      );

      if (response.ok) {
        setMensagem('Código verificado com sucesso.');
        setEtapa(3);
      } else {
        const data = await response.json();
        setMensagem(data?.message || 'Código inválido.');
      }
    } catch (error) {
      setMensagem('Erro ao conectar com o servidor.');
    } finally {
      setLoadingVerificarCodigo(false);
    }
  };

  // Cadastro final
  const handleCadastro = async () => {
    setErro('');
    setMensagem('');
    setLoadingCadastro(true);

    try {
      let fotoPerfilURL = '';

      if (fotoPerfilUri) {
        fotoPerfilURL = await uploadImagem(fotoPerfilUri);
      }

      const novoUsuario = {
        nome,
        nome_usuario,
        email,
        senha,
        FotoPerfil: fotoPerfilURL,
        biografia,
        dataaniversario: dataAniversario,
        CodigoVerificacao: codigoVerificacao,
      };

      const response = await fetch(
        'https://trabalho-tales-rede-social-tecnol-gica.onrender.com/api/auth/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(novoUsuario),
        }
      );

      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      const data = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        const msg = isJson ? data.message : data;
        setErro(msg || 'Erro ao cadastrar');
        setLoadingCadastro(false);
        return;
      }

      setShowModalSucesso(true);
      setTimeout(() => {
        setShowModalSucesso(false);
        navigation.navigate('Login'); // Ajuste para sua rota de login
      }, 3000);
    } catch (error) {
      console.error('Erro ao cadastrar:', error);
      setErro('Erro ao conectar com o servidor');
    } finally {
      setLoadingCadastro(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Paradise</Text>
      <Text style={styles.subtitle}>Cadastre-se para ver fotos e vídeos dos seus amigos.</Text>

      {etapa === 1 && (
        <View>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Nome completo"
              value={nome}
              onChangeText={setNome}
              style={styles.input}
              autoCapitalize="words"
            />
            <FontAwesome name="user" size={20} color="#999" style={styles.icon} />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="E-mail"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
            <FontAwesome name="envelope" size={20} color="#999" style={styles.icon} />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Senha"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry={!mostrarSenha}
              style={styles.input}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
              <FontAwesome name={mostrarSenha ? 'eye-slash' : 'eye'} size={20} color="#999" style={styles.icon} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Confirme senha"
              value={repetirSenha}
              onChangeText={setRepetirSenha}
              secureTextEntry={!mostrarRepetirSenha}
              style={styles.input}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setMostrarRepetirSenha(!mostrarRepetirSenha)}>
              <FontAwesome name={mostrarRepetirSenha ? 'eye-slash' : 'eye'} size={20} color="#999" style={styles.icon} />
            </TouchableOpacity>
          </View>

          <View style={{ marginVertical: 10 }}>
            <Text>Data de Nascimento</Text>
            <TextInput
              placeholder="AAAA-MM-DD"
              value={dataAniversario}
              onChangeText={setDataAniversario}
              style={styles.input}
            />
            {/* Idealmente trocar para DatePicker nativo, mas simplificado aqui */}
          </View>

          {mensagem ? <Text style={styles.message}>{mensagem}</Text> : null}
          {erro ? <Text style={styles.error}>{erro}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loadingProximaEtapa && styles.buttonDisabled]}
            onPress={handleProximaEtapa}
            disabled={loadingProximaEtapa}
          >
            {loadingProximaEtapa ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Próximo</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {etapa === 2 && (
        <View>
          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Código de verificação"
              value={codigoVerificacao}
              onChangeText={setCodigoVerificacao}
              style={styles.input}
              autoCapitalize="none"
            />
          </View>

          {mensagem ? <Text style={styles.message}>{mensagem}</Text> : null}
          {erro ? <Text style={styles.error}>{erro}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loadingVerificarCodigo && styles.buttonDisabled]}
            onPress={handleVerificarCodigo}
            disabled={loadingVerificarCodigo}
          >
            {loadingVerificarCodigo ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Verificar código</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {etapa === 3 && (
        <View>
          <TouchableOpacity onPress={escolherFoto} style={styles.photoPicker}>
            {fotoPerfilUri ? (
              <Image source={{ uri: fotoPerfilUri }} style={styles.photo} />
            ) : (
              <View style={[styles.photo, styles.photoPlaceholder]}>
                <Text style={{ color: '#666' }}>Selecionar foto</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.inputWrapper}>
            <TextInput
              placeholder="Nome de usuário"
              value={nome_usuario}
              onChangeText={setNome_usuario}
              style={styles.input}
              autoCapitalize="none"
            />
            <FontAwesome name="user-circle" size={20} color="#999" style={styles.icon} />
          </View>

          <View style={{ marginVertical: 10 }}>
            <Text>Biografia</Text>
            <TextInput
              placeholder="Biografia"
              value={biografia}
              onChangeText={setBiografia}
              style={[styles.input, { height: 80 }]}
              multiline
              numberOfLines={4}
            />
          </View>

          <Text style={styles.termsText}>
            Ao se cadastrar, você concorda com nossos Termos, Política de Privacidade e Política de Cookies.
          </Text>

          {mensagem ? <Text style={styles.message}>{mensagem}</Text> : null}
          {erro ? <Text style={styles.error}>{erro}</Text> : null}

          <TouchableOpacity
            style={[styles.button, loadingCadastro && styles.buttonDisabled]}
            onPress={handleCadastro}
            disabled={loadingCadastro}
          >
            {loadingCadastro ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Cadastrar</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <Modal visible={showModalSucesso} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FontAwesome name="check-circle" size={60} color="green" />
            <Text style={{ marginTop: 15, fontSize: 18, fontWeight: 'bold' }}>Cadastro efetuado com sucesso!</Text>
            <Text style={{ marginTop: 10 }}>Redirecionando para login...</Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Cadastro;
