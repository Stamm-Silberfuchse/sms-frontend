import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const parseField = (type, value) => {
  // if(type === 'Date') {
  //   return format(value.toDate, 'dd.MM.yyyy', { locale: de })
  // }
  if(value !== undefined && value !== null) {
    if(type === 'Boolean') {
      return JSON.parse(value) ? 'Ja' : 'Nein'
    }
    if(type === 'GENDER') {
      switch(value) {
        case "M":
          return 'Männlich'
        case "W":
          return 'Weiblich'
        case "D":
          return 'Divers'
        case "-":
          return 'Keine Angabe'
        default:
          return 'Keine Angabe'
      }
    }
  }
  return value
}

export { parseField }
