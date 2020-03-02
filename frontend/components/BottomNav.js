// import React, { Component } from 'react';
// import { Container, Header, Content, Footer, FooterTab, Button, Icon, Text } from 'native-base';

// class BottomNav extends React.Component {
//   render() {
//     return (
    //   <Container>
    //     <Content />
    //     <Footer>
    //       <FooterTab>
    //         <Button vertical>
    //           <Icon name="apps" />
    //           <Text>Apps</Text>
    //         </Button>
    //         <Button vertical>
    //           <Icon name="camera" />
    //           <Text>Camera</Text>
    //         </Button>
    //         <Button vertical active>
    //           <Icon active name="navigate" />
    //           <Text>Navigate</Text>
    //         </Button>
    //         <Button vertical>
    //           <Icon name="person" />
    //           <Text>Contact</Text>
    //         </Button>
    //       </FooterTab>
    //     </Footer>
    //   </Container>
//     );
//   }
// }

// export default BottomNav;

import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { Container, Header, Content, Footer, FooterTab, Button, Icon, Text } from 'native-base';


export default class CustomTabBar extends React.Component {
  render() {
    const { state } = this.props.navigation;
    const activeTabIndex = state.index;

    return (
        <Footer>
          <FooterTab>
            {
                state.routes.map(element => (
                    <Button 
                        key={element.key}
                        vertical
                        onPress={() => Actions[element.key]()}
                    >
                        <Icon name="apps" />
                        <Text>Apps</Text>
                    </Button>
                ))
            }
            
        
          </FooterTab>
        </Footer>      
    );
  }
}