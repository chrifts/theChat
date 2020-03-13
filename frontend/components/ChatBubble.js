import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import {parseDateOnly} from '../helpers/dateParse'


const styles = StyleSheet.create({
    same: {
        padding: 7,
        margin: 5,
        borderStyle: 'solid',
        borderRadius: 5,
        minWidth: '10%',
        maxWidth: '80%',
    },
    right: {
        backgroundColor: '#0084ff',
        alignSelf: 'flex-end'    
    },
    left: {
        backgroundColor: '#44bec7',
        alignSelf: 'flex-start'
    },
    text: {
        color: 'white',
        fontSize: 18
    }, 
    time: {
        textAlign: 'right',
        fontSize: 10,
        color: '#eaeaea'
    }
})

class ChatBubble extends React.Component {
    constructor(props) {
        super(props);
        
    }
    
    render() {
        if(this.props.iSend) {
            return (
                <View style={[styles.right, styles.same]}>
                    <Text style={styles.text}>{this.props.message}</Text>
                    <View>
                        <Text style={styles.time}>{parseDateOnly(this.props.allData.createdAt, true)}</Text>
                    </View>
                </View>
            );
        } else {
            return (
                <View style={[styles.left, styles.same]}>
                    <Text style={styles.text}>{this.props.message}</Text>
                    <View>
                        <Text style={[styles.time, {color: '#eaeaea'}]}>{parseDateOnly(this.props.allData.createdAt, true)}</Text>
                    </View>
                </View>
            );
        }
        
    }
}
export default ChatBubble;