import React from 'react';
import { SafeAreaView, StyleSheet, StatusBar } from 'react-native';
import Login from '../page/Login/Login';

export default function Index() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Aqui ajusta os ícones para escuros, pra aparecer em fundo claro */}
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <Login />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
