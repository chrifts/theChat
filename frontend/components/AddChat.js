import React from 'react';
import axios from 'axios';
import { StyleSheet, View, Text, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { Container, Content, Form, Item, Input, Text as Txt, Button } from 'native-base';

import GoTo from '../constants/navigate';
import Actions from 'react-native-router-flux';


class AddChat extends React.Component {

  constructor(props){
    super(props);
    this.state = {
        email: '',
        pass: '',
        isFetching: true
    }
  }

  
    render() {
        return (
            <Button
              transparent
              style={{marginLeft: 0}}
              title='Add'
              onPress={() => {
                  GoTo('new_chat', null, 'navigate')
                  //Actions.new_chat();
              }}  
            >
              <Txt>Add</Txt>
            </Button>
        );
    }
  }

export default AddChat;