import moment from 'moment'

export function monthGenerator() {
  let options = {
    months: 12,
    years: 10,
    year_start: 2018,
  }

  const rows = []

  const add = (year, month) => {
    let monthLabel = moment.months(month - 1);
    let monthValue = month < 10 ? `0${month}` : month

    rows.push({
      text: `${monthLabel}/${year}`,
      value: `${year}-${monthValue}-01`,
    })
  }

  for (let i = 0; i <= options.years; i++) {
    const year = options.year_start + i

    for (let month = 1; month <= options.months; month++) {
      add(year, month)
    }
  }

  return rows
}

export function mask(value, mask) {

  if(!value) return ''

  let format = (value, mask) => {
    let [posix, masked, total] = [0, '', mask.length];

    value = String(value);

    for (let i = 0; i <= (total - 1); i++) {
      if (mask[i] !== "#") {
        masked += mask[i];
        continue;
      }

      if (!value[posix]) {
        continue;
      }

      masked += value[posix++];
    }

    return masked;
  }

  if (typeof mask !== 'string') {
    const result = mask
      .map((v) => {
        const masked = format(value, v)

        return [
          masked,
          masked.length === v.length
        ]
      })
      .filter(h => h[1])
      .map(h => h[0])

    return result.length > 0 ? result[0] : '';
  }

  return format(value, mask);
}

export function formatDate(value, format = 'DD/MM/YYYY HH:mm:ss') {
  return moment(value).format(format) || '-';
}

export const currencies = {
  brl: (value) => new Intl.NumberFormat('pt-br', { style: 'currency', currency: 'BRL' }).format(value),
  usd: (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value),
}

export const clearText = (value) => value ?  String(value).replace(/\W+/g, '').trim() : ''

export const clearPhone = (value) => clearText(value)
