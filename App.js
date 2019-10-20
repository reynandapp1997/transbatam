/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import React, {Component} from 'react';
import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import {createStackNavigator} from 'react-navigation-stack';

import HomeScreen from './src/screens/HomeScreen';
import SplashScreen from './src/screens/SplashScreen';

const StackNavigator = createStackNavigator({
  HomeScreen: {
    screen: HomeScreen,
    navigationOptions: {
      header: null,
    },
  },
});

const SwitchNavigator = createSwitchNavigator({
  Splash: {
    screen: SplashScreen,
  },
  Home: {
    screen: StackNavigator,
  },
});

const AppContainer = createAppContainer(SwitchNavigator);

class App extends Component {
  render() {
    return <AppContainer />;
  }
}

export default App;
