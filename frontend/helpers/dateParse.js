const parseDate = (item) => {
    var lastMessage;
    var lmDate;
    var theDate;
    
    if(item.lastMessage[0]) {
      item.lastMessage[0][0].length >= 60 ? lastMessage = item.lastMessage[0][0].substring(0, 60) + ' ...' : lastMessage = item.lastMessage[0][0]
      item.lastMessage[0] ? lmDate = item.lastMessage[0][1] : lmDate = null
      theDate = parseDateOnly(lmDate)
    } else {
      lastMessage = 'Start the chat!'
      theDate = null;
    }

    return {
        lastMessage: lastMessage,
        theDate: theDate
    }
}

const parseDateOnly = (lmDate, inChat = false) => {
    
    var finalDate;
    var theDate;
    var timestamp = Date.parse(lmDate);
    if (isNaN(timestamp) == false) {
    
    var serverTime = new Date(timestamp); 
    var serverUserOffset = serverTime.getTimezoneOffset()

    if(serverUserOffset < 0) {
        //The server have negative minutes than the user. Must add minutes to theDate
        finalTimestamp = timestamp + Math.abs(serverUserOffset) * 60
    } else if (serverUserOffset == 0) {
        finalTimestamp = timestamp;
    } else {
        finalTimestamp = timestamp - Math.abs(serverUserOffset) * 60
    }
    
    finalDate = new Date(finalTimestamp)

    var nownow = new Date(Date.now());
    var minutesForNow = nownow.getMinutes() < 10 ? '0'+nownow.getMinutes().toString() : nownow.getMinutes().toString();
    var theDateForNow = nownow.getHours().toString() + ':' + minutesForNow;
    

    if(finalDate.getDate() == new Date(Date.now()).getDate() || inChat) {
        var minutes = finalDate.getMinutes() < 10 ? '0'+finalDate.getMinutes().toString() : finalDate.getMinutes().toString();
        theDate = finalDate.getHours().toString() + ':' + minutes;
        
    } else {
        var diffDays = new Date(Date.now()).getDate() - finalDate.getDate();
        switch (diffDays) {
        case 1:
            theDate = 'Yesterday'
            break;
        case 2:
            theDate = '2 days ago'
            break;
        case 3:
            theDate = '3 days ago'
            break;
        case 4:
            theDate = '4 days ago'
            break;  
        default:
            theDate = finalDate.getDay().toString() +'.'+ finalDate.getMonth().toString() +'.'+ finalDate.getFullYear().toString();
            break;
        }
    }
    } else { 
        
        if(inChat) {
            
            theDate = theDateForNow
        } else {
            theDate = 'Now'
        }
    }
    return theDate
}

export {
    parseDate,
    parseDateOnly
}