import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { LoginScreen } from '../../src/screens/LoginScreen';

jest.mock('../../src/hooks/useAuth', () => ({
  useLogin: () => ({
    mutate: jest.fn(),
    isPending: false,
  }),
}));

describe('LoginScreen', () => {
  it('renders email and password inputs', () => {
    const { getByTestId } = render(<LoginScreen />);
    expect(getByTestId('email-input')).toBeTruthy();
    expect(getByTestId('password-input')).toBeTruthy();
  });

  it('renders login button', () => {
    const { getByTestId } = render(<LoginScreen />);
    expect(getByTestId('login-button')).toBeTruthy();
  });

  it('shows alert when email is empty', () => {
    const { getByTestId } = render(<LoginScreen />);
    const alertSpy = jest.spyOn(require('react-native').Alert, 'alert');
    fireEvent.press(getByTestId('login-button'));
    expect(alertSpy).toHaveBeenCalledWith('エラー', 'メールアドレスとパスワードを入力してください');
  });
});
