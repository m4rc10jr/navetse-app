export default (options, custom = {}) => {
  const {
    sortBy = ['id'],
    sortDesc = [false],
  } = options;

  const [sortByKey, sortByDirection] = [
    sortBy[0] ?? 'id',
    sortDesc[0] ?? false,
  ]

  const params = {}

  const orderByDirection = sortByDirection ? 'desc' : 'asc'

  if (custom[sortByKey]) {
    params[custom[sortByKey]] = orderByDirection
  } else {
    params[`orderBy[${sortByKey}]`] = orderByDirection
  }

  return params;
}
