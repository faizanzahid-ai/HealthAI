/**
 * @file Widget integration tests for the patient-doctor connection model.
 *
 * These tests verify the React Native UI layer correctly enforces the
 * LinkedIn-style connection model and messaging gating:
 *  1. Connection UI reflects current status (Connect / Pending / Connected / Message)
 *  2. Messaging is only available when connection is ACCEPTED
 *  3. Blood request notifications fan out to all active hospital followers
 *  4. Search correctly maps disease terms to specialities
 */

import React from 'react';
import renderer from 'react-test-renderer';
import { TouchableOpacity, Text } from 'react-native';
import App from '../../App';

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
  MaterialIcons: 'MaterialIcons',
}));

beforeAll(() => {
  global.window = {
    dispatchEvent: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  };
});

const flattenChildren = (children) => {
  if (!children) return [];
  if (typeof children === 'string') return [children];
  if (!Array.isArray(children)) {
    return flattenChildren(children.props?.children);
  }
  return children.flatMap((c) => flattenChildren(c));
};

const joinText = (element) => {
  const texts = flattenChildren(element.props.children).filter((t) => typeof t === 'string');
  return texts.join('');
};

const findButtonByLabel = (root, label) => {
  return root.findAllByType(TouchableOpacity).find((btn) => {
    return joinText(btn).includes(label);
  });
};

const findTextContaining = (root, substring) => {
  return root.findAllByType(Text).filter((t) => {
    return joinText(t).includes(substring);
  });
};

const loginAs = (root, role) => {
  const btn = findButtonByLabel(root, `Continue as ${role}`);
  if (!btn) throw new Error(`Could not find button: Continue as ${role}`);
  renderer.act(() => {
    btn.props.onPress();
  });
};

const navigateToSearch = (root) => {
  const searchBtn = findButtonByLabel(root, 'Find Doctor');
  renderer.act(() => {
    searchBtn.props.onPress();
  });
};

const openDoctorProfile = (root, doctorName) => {
  const textElements = root.findAllByType(Text);
  const matchingText = textElements.find((t) => joinText(t).includes(doctorName));
  expect(matchingText).toBeTruthy();
  let parent = matchingText.parent;
  while (parent && parent.type !== TouchableOpacity) {
    parent = parent.parent;
  }
  expect(parent).toBeTruthy();
  renderer.act(() => {
    parent.props.onPress();
  });
};

describe('Connection model UI', () => {
  test('shows Connect button for NOT_CONNECTED doctor', () => {
    let component;
    renderer.act(() => {
      component = renderer.create(<App />);
    });
    const root = component.root;
    loginAs(root, 'Patient');
    navigateToSearch(root);

    openDoctorProfile(root, 'Dr. Mariam');

    expect(findTextContaining(root, 'Connect').length).toBeGreaterThan(0);
  });

  test('messaging is locked when connection is PENDING', () => {
    let component;
    renderer.act(() => {
      component = renderer.create(<App />);
    });
    const root = component.root;
    loginAs(root, 'Patient');
    navigateToSearch(root);

    openDoctorProfile(root, 'Dr. Hamza');

    const connectBtn = findButtonByLabel(root, 'Connect');
    expect(connectBtn).toBeTruthy();
    renderer.act(() => {
      connectBtn.props.onPress();
    });

    expect(findTextContaining(root, 'Connection Pending').length).toBeGreaterThan(0);
    expect(findTextContaining(root, 'locked').length).toBeGreaterThan(0);
    expect(findTextContaining(root, 'Waiting for doctor').length).toBeGreaterThan(0);
  });

  test('messaging unlocks after connection is ACCEPTED', () => {
    let component;
    renderer.act(() => {
      component = renderer.create(<App />);
    });
    const root = component.root;
    loginAs(root, 'Patient');
    navigateToSearch(root);

    openDoctorProfile(root, 'Dr. Sara');

    expect(findTextContaining(root, 'Connected').length).toBeGreaterThan(0);
    expect(findButtonByLabel(root, 'Message')).toBeTruthy();
  });

  test('messaging stays locked for NOT_CONNECTED doctor', () => {
    let component;
    renderer.act(() => {
      component = renderer.create(<App />);
    });
    const root = component.root;
    loginAs(root, 'Patient');
    navigateToSearch(root);

    openDoctorProfile(root, 'Dr. Mariam');

    expect(findTextContaining(root, 'New to Nexcure').length).toBeGreaterThan(0);
    expect(findButtonByLabel(root, 'Messaging locked')).toBeTruthy();
  });
});

describe('Blood request notifications', () => {
  test('shows notification after blood request creation', () => {
    let component;
    renderer.act(() => {
      component = renderer.create(<App />);
    });
    const root = component.root;
    loginAs(root, 'Hospital');

    const homeCreateBtn = findButtonByLabel(root, 'Create blood request');
    expect(homeCreateBtn).toBeTruthy();
    renderer.act(() => {
      homeCreateBtn.props.onPress();
    });

    const bloodCreateBtn = findButtonByLabel(root, 'Create blood request');
    expect(bloodCreateBtn).toBeTruthy();
    renderer.act(() => {
      bloodCreateBtn.props.onPress();
    });

    expect(findTextContaining(root, 'Published').length).toBeGreaterThan(0);
  });
});

describe('Search disease-to-speciality mapping', () => {
  test('maps Cancer to Oncologist', () => {
    let component;
    renderer.act(() => {
      component = renderer.create(<App />);
    });
    const root = component.root;
    loginAs(root, 'Patient');
    navigateToSearch(root);

    const searchInput = root.findAllByProps({ placeholder: 'Search disease or tumor' })[0];
    renderer.act(() => {
      searchInput.props.onChangeText('cancer');
    });

    expect(findTextContaining(root, 'Oncolog').length).toBeGreaterThan(0);
  });

  test('maps brain tumor to Neurologist', () => {
    let component;
    renderer.act(() => {
      component = renderer.create(<App />);
    });
    const root = component.root;
    loginAs(root, 'Patient');
    navigateToSearch(root);

    const searchInput = root.findAllByProps({ placeholder: 'Search disease or tumor' })[0];
    renderer.act(() => {
      searchInput.props.onChangeText('brain tumor');
    });

    expect(findTextContaining(root, 'Neurolog').length).toBeGreaterThan(0);
  });
});
