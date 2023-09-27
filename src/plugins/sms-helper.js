import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const parseField = (type, value) => {
  // console.log("Parsing:", type)
  // console.log("Value:", value)
  if(value) {
    if(type === 'DATE') {
      return format(new Date(value), 'dd.MM.yyyy', { locale: de })
    }
    if(type === 'BOOL') {
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
