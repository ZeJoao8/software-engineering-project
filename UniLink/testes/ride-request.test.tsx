import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import RideRequestScreen from '../components/RideRequestScreen';

describe('Ride Request Flow Acceptance Test', () => {
    it('should allow a student to request a ride and receive confirmation', async () => {

        const { getByTestId, getByText, queryByText } = render(<RideRequestScreen />);

        expect(getByText('Pedir uma Boleia')).toBeTruthy();

        const pickupInput = getByTestId('pickup-input');
        const destinationInput = getByTestId('destination-input');
        const confirmButton = getByTestId('confirm-button');

        fireEvent.changeText(pickupInput, 'FEUP');
        expect(pickupInput.props.value).toBe('FEUP');

        fireEvent.changeText(destinationInput, 'Trindade');
        expect(destinationInput.props.value).toBe('Trindade');

        fireEvent.press(confirmButton);

        expect(getByTestId('searching-indicator')).toBeTruthy();
        expect(getByText('A procurar motoristas disponíveis...')).toBeTruthy();

        await waitFor(() => {
            expect(queryByText('A procurar motoristas disponíveis...')).toBeFalsy();

            expect(getByText('Pedido de Boleia Confirmado!')).toBeTruthy();
            expect(getByText('Um motorista aceitou o seu pedido.')).toBeTruthy();

            expect(getByText('Localização de encontro: FEUP')).toBeTruthy();
            expect(getByText('Destino: Trindade')).toBeTruthy();
        }, { timeout: 3000 });
    });
});
