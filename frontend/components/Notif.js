import React from 'react';
import { Button, Platform, Image, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


class Notif extends React.Component {
    
    render() {
      
      return (
        <TouchableOpacity
       style={styles.backButton}
       onPress={() => {
          //console.log(this.props)
          if(this.props.color == 'yellow') {
            this.props.nav.navigate('LoginScreen');
          } else {
            //console.log(this.props.nav.navigate('Mensajes'));
          }
       }}
     >
        <Ionicons
          name="ios-notifications"
          size={25}
          color={this.props.color}
        />
      </TouchableOpacity>
      );
    }
  }

  const styles = StyleSheet.create({
    backButton: {
      marginLeft: 10
    },
   });

  export default Notif;