import { helpers } from 'vuelidate/lib/validators'

export const gt = (eq) => helpers.withParams({ type: 'gt', gt: eq }, function (value, vm) {
  return {
    number: () => Number(value) > Number(eq),
    string: () => value > vm[eq],
    function: () => value <= eq(vm, value)
  }[typeof eq]()
})

export const gte = (eq) => helpers.withParams({ type: 'gte', gte: eq }, function (value, vm) {
  return {
    number: () => Number(value) >= Number(eq),
    string: () => value >= vm[eq],
    function: () => value <= eq(vm, value)
  }[typeof eq]()
})

export const lt = (eq) => helpers.withParams({ type: 'lt', lt: eq }, function (value, vm) {
  return {
    number: () => Number(value) < Number(eq),
    string: () => value < vm[eq],
    function: () => value <= eq(vm, value)
  }[typeof eq]()
})

export const lte = (eq) => helpers.withParams({ type: 'lte', lte: eq }, function (value, vm) {
  return {
    number: () => Number(value) <= Number(eq),
    string: () => value <= vm[eq],
    function: () => value <= eq(vm, value)
  }[typeof eq]()
})

export const digits_between = (min, max) => helpers.withParams({ type: 'digits_between', min, max }, function (value, vm) {
  if (!value) return true

  value = value.length;

  return [min, max].includes(value)
})

export const unique = (ref) => helpers.withParams({ type: 'unique' }, function (value, vm) {
  if (!value) return true

  return true
})
