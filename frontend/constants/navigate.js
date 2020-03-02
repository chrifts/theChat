import {Actions} from 'react-native-router-flux';

const GoTo = (screenKey, params = null, method = 'push') => { 
    if(Actions.currentScene !== screenKey) {    
        if(method == 'navigate') {
            Actions[screenKey].call(params)
        } else {
            Actions.push(screenKey, params)
        }
        
    }

}

export default GoTo