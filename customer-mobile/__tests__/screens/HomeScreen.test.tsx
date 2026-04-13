import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { HomeScreen } from '../../src/screens/HomeScreen';

describe('HomeScreen', () => {
  it('renders the app name', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Customer Mobile')).toBeTruthy();
  });

  it('renders the welcome text', () => {
    render(<HomeScreen />);
    expect(screen.getByText('ようこそ')).toBeTruthy();
  });
});
