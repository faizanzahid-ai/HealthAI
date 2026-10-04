import React from 'react';
import renderer from 'react-test-renderer';
import { TouchableOpacity } from 'react-native';
import App from './App';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

beforeAll(() => {
  global.window = {
    dispatchEvent: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
});

describe('Nexcure authentication flow', () => {
  it('offers both login and sign-up paths from the auth screen', () => {
    let component;
    renderer.act(() => {
      component = renderer.create(<App />);
    });
    const root = component.root;

    expect(root.findAllByProps({ children: 'Welcome back' }).length).toBeGreaterThan(0);

    const authTabs = root.findAllByType(TouchableOpacity);
    const createAccountButton = authTabs[1];
    renderer.act(() => {
      createAccountButton.props.onPress();
    });

    expect(root.findAllByProps({ children: 'Create your account' }).length).toBeGreaterThan(0);
    expect(root.findAllByProps({ placeholder: 'Full name' }).length).toBeGreaterThan(0);
    expect(root.findAllByProps({ placeholder: 'Email address' }).length).toBeGreaterThan(0);
  });
});
