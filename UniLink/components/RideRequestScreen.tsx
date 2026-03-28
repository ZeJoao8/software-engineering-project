import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ActivityIndicator } from 'react-native';

export default function RideRequestScreen() {
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [status, setStatus] = useState<'idle' | 'searching' | 'accepted'>('idle');

  const handleConfirm = () => {

    setStatus('searching');

    //Simula o tempo de espera até um motorista aceitar o pedido, por 2 segundos
    setTimeout(() => {
      setStatus('accepted');
    }, 2000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Pedir uma Boleia</Text>

      {status === 'idle' && (
        <View style={styles.form}>
          <Text>Localização de encontro</Text>
          <TextInput
            style={styles.input}
            placeholder="Insira localização de encontro"
            value={pickup}
            onChangeText={setPickup}
            testID="pickup-input"
          />

          <Text>Destino</Text>
          <TextInput
            style={styles.input}
            placeholder="Introduza o destino"
            value={destination}
            onChangeText={setDestination}
            testID="destination-input"
          />

          <Button
            title="Confirmar Pedido de Boleia"
            onPress={handleConfirm}
            testID="confirm-button"
          />
        </View>
      )}

      {status === 'searching' && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#0000ff" testID="searching-indicator" />
          <Text>A procurar motoristas disponíveis...</Text>
        </View>
      )}

      {status === 'accepted' && (
        <View style={styles.success}>
          <Text style={styles.successText}>Pedido de Boleia Confirmado!</Text>
          <Text>Um motorista aceitou o seu pedido.</Text>
          <Text>Localização de encontro: {pickup}</Text>
          <Text>Destino: {destination}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  form: { gap: 10 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5, marginBottom: 15 },
  loading: { alignItems: 'center', marginVertical: 30 },
  success: { alignItems: 'center', marginVertical: 30, padding: 20, backgroundColor: '#d4edda', borderRadius: 10 },
  successText: { fontSize: 20, color: '#155724', fontWeight: 'bold', marginBottom: 10 }
});
