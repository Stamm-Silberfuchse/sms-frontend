import { format } from 'date-fns'
import { de } from 'date-fns/locale'

const parseField = (type, value) => {
  if(value !== undefined && value !== null) {
    if(type === 'Boolean') {
      return JSON.parse(value) ? 'Ja' : 'Nein'
    }
    if(value?.length === 0) {
      return '-'
    }
    if(type === 'date') {
      return format(new Date(value), 'dd.MM.yyyy', { locale: de })
    }
    if(type === 'tel') {
      return "<a class='link-none' href='tel:" + value + "'>" + value + "</a>"
    }
    if(type === 'email') {
      return "<a class='link-none' href='mailto:" + value + "'>" + value + "</a>"
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
