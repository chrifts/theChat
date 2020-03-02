import React from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import { Actions } from 'react-native-router-flux';
import GoTo from '../constants/navigate';

class CustomTab extends React.Component {
  render() {
    const { state } = this.props.navigation;
    const activeTabIndex = state.index;
    console.log(state);
    return (
      <View>
        {
          state.routes.map(element => (
            
            <TouchableOpacity key={element.key} onPress={() => GoTo('messages2')}>
              <Text>{element.key.toUpperCase()}</Text>
            </TouchableOpacity>
          ))
        }
      </View>
    );
  }
}

export default CustomTab;