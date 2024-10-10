import { format, differenceInDays, differenceInMonths, differenceInCalendarYears } from 'date-fns'
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

const memberFields = [
  {id: 'MNR', field: 'MNR', name: 'Mitgliedsnummer', type: 'text', category: ''},
  {id: 'FIRST_NAME', field: 'FIRST_NAME', name: 'Vorname', type: 'text', category: 'Allgemein'},
  {id: 'LAST_NAME', field: 'LAST_NAME', name: 'Nachname', type: 'text', category: 'Allgemein'},
  {id: 'NICKNAME', field: 'NICKNAME', name: 'Fahrtenname', type: 'text', category: 'Allgemein'},
  {id: 'ADDRESS', field: 'ADDRESS', name: 'Adresse', type: 'text', category: 'Allgemein'},
  {id: 'ZIP', field: 'ZIP', name: 'PLZ', type: 'text', category: 'Allgemein'},
  {id: 'CITY', field: 'CITY', name: 'Ort', type: 'text', category: 'Allgemein'},
  {id: 'COUNTRY', field: 'COUNTRY', name: 'Land', type: 'text', category: 'Allgemein'},
  {id: 'NATIONALITY', field: 'NATIONALITY', name: 'Nationalität', type: 'text', category: 'Allgemein'},
  {id: 'BIRTHDAY', field: 'BIRTHDAY', name: 'Geburtstag', type: 'date', category: 'Allgemein'},
  {id: 'BIRTHPLACE', field: 'BIRTHPLACE', name: 'Geburtsort', type: 'text', category: 'Allgemein'},
  {id: 'PHONE', field: 'PHONE', name: 'Telefon', type: 'tel', category: 'Allgemein'},
  {id: 'MOBILE', field: 'MOBILE', name: 'Mobil', type: 'tel', category: 'Allgemein'},
  {id: 'EMAIL', field: 'EMAIL', name: 'E-Mail', type: 'email', category: 'Allgemein'},

  {id: 'IBAN', field: 'IBAN', name: 'IBAN', type: 'text', category: 'Bank'},
  {id: 'BIC', field: 'BIC', name: 'BIC', type: 'text', category: 'Bank'},
  {id: 'MANDATE_REF', field: 'MANDATE_REF', name: 'Mandatsreferenz', type: 'text', category: 'Bank'},
  {id: 'MANDATE_DATE', field: 'MANDATE_DATE', name: 'Mandats-Datum', type: 'date', category: 'Bank'}
]

const dateIntervalFormat = (start, end) => {

  const isSameYear = start.getFullYear() === end.getFullYear()
  const isSameMonth = isSameYear && start.getMonth() === end.getMonth()
  const isSameDay = isSameMonth && start.getDate() === end.getDate()

  if (isSameDay) {
    return format(start, 'dd.MM.yyyy')
  }
  if (isSameMonth) {
    return format(start, 'dd.') + ' - ' + format(end, 'dd.MM.yyyy')
  }
  if (isSameYear) {
    return format(start, 'dd.MM.') + ' - ' + format(end, 'dd.MM.yyyy')
  }
  return format(start, 'dd.MM.yyyy') + ' - ' + format(end, 'dd.MM.yyyy')
}

const emailTemplate = (body) => `
  <mjml version="3.3.3">
    <mj-body background-color="#F4F4F4" color="#55575d" font-family="Arial, sans-serif">
      <mj-section background-color="#202020" background-repeat="repeat" padding="20px 0" text-align="start" vertical-align="top">
        <mj-column>
          <mj-image align="start" padding="10px 25px" src="https://stamm-silberfuechse.de/wp-content/uploads/2021/07/silberfuchs_tiny2-300x252.png" width="80px"></mj-image>
        </mj-column>
      </mj-section>
      <mj-section background-color="#ffffff" background-repeat="repeat" background-size="auto" padding="20px 0px 20px 0px" text-align="center" vertical-align="top">
        <mj-column>
          <mj-text font-family="Arial, sans-serif" padding="0px 25px 0px 25px">
            ${body}
          </mj-text>
        </mj-column>
      </mj-section>
      <mj-section background-color="#202020" background-repeat="repeat" padding="20px 0" text-align="center" vertical-align="top">
        <mj-column>
          <mj-text align="center" color="#ffffff" font-family="Arial, sans-serif" font-size="13px" line-height="22px" padding="10px 25px">
            Im <a style="color:#ffffff" href="http://www.mailjet.com" target="_blank"><b>Browser ansehen</b></a>
          </mj-text>
        </mj-column>
      </mj-section>
    </mj-body>
  </mjml>
`

export { parseField, memberFields, dateIntervalFormat, emailTemplate }
